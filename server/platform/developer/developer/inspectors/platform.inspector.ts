import type { IInspector } from "@server/platform/developer/developer/contracts";
import {
  createInspectionResult,
  type InspectionResult,
} from "@server/platform/developer/developer/models";
import { createInspectionCompletedEvent } from "@server/platform/developer/developer/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import { DeveloperTokens } from "@server/platform/developer/developer/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";

const REQUIRED_PLATFORM_TOKENS = Object.freeze([
  DeveloperTokens.DeveloperPlatform,
  DeveloperTokens.ArchitectureAnalyzer,
  DeveloperTokens.DeveloperCommandRunner,
]);

/** Inspects platform layer registration and developer platform wiring. */
export class PlatformInspector implements IInspector {
  readonly id = "platform-inspector";

  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly serviceRegistry: ServiceRegistry,
  ) {}

  inspect(target?: string): InspectionResult {
    const bundle = this.documentation.generateDocumentation();
    const platforms = target
      ? bundle.platformCatalog.platforms.filter((platform) => platform.id === target)
      : bundle.platformCatalog.platforms;

    const findings = platforms.flatMap((platform) => {
      const issues: { code: string; message: string; target?: string }[] = [];
      if (platform.components.length === 0) {
        issues.push({
          code: "EMPTY_PLATFORM_COMPONENTS",
          message: "Platform has no documented components.",
          target: platform.id,
        });
      }
      return issues;
    });

    for (const token of REQUIRED_PLATFORM_TOKENS) {
      if (!this.serviceRegistry.has(token)) {
        findings.push({
          code: "DEVELOPER_PLATFORM_NOT_REGISTERED",
          message: `Required developer platform token is not registered: ${String(token)}`,
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
