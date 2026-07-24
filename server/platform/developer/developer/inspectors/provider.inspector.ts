import type { IInspector } from "@server/platform/developer/developer/contracts";
import {
  createInspectionResult,
  type InspectionResult,
} from "@server/platform/developer/developer/models";
import { createInspectionCompletedEvent } from "@server/platform/developer/developer/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";

/** Inspects provider registry against documentation metadata. */
export class ProviderInspector implements IInspector {
  readonly id = "provider-inspector";

  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  inspect(target?: string): InspectionResult {
    const bundle = this.documentation.generateDocumentation();
    const documented = new Map(
      bundle.providerCatalog.providers.map((provider) => [provider.id, provider]),
    );
    const live = this.providerRegistry.list();
    const liveIds = new Set(live.map((provider) => provider.id));

    const findings: { code: string; message: string; target?: string }[] = [];

    for (const provider of live) {
      if (target && provider.id !== target) {
        continue;
      }
      if (!documented.has(provider.id)) {
        findings.push({
          code: "UNDOCUMENTED_PROVIDER",
          message: `Provider "${provider.id}" is registered but missing from documentation.`,
          target: provider.id,
        });
      }
    }

    for (const provider of bundle.providerCatalog.providers) {
      if (target && provider.id !== target) {
        continue;
      }
      if (!liveIds.has(provider.id)) {
        findings.push({
          code: "MISSING_PROVIDER",
          message: `Documented provider "${provider.id}" is not registered.`,
          target: provider.id,
        });
      }
    }

    const result = createInspectionResult({
      inspectorId: this.id,
      passed: findings.length === 0,
      findings,
    });
    createInspectionCompletedEvent(result);
    return result;
  }
}
