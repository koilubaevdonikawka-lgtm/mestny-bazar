import type { IInspector } from "@server/platform/developer/developer/contracts";
import {
  createInspectionResult,
  type InspectionResult,
} from "@server/platform/developer/developer/models";
import { createInspectionCompletedEvent } from "@server/platform/developer/developer/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";

/** Inspects module registration and public API metadata. */
export class ModuleInspector implements IInspector {
  readonly id = "module-inspector";

  constructor(private readonly documentation: DocumentationPlatform) {}

  inspect(target?: string): InspectionResult {
    const bundle = this.documentation.generateDocumentation();
    const entries = target
      ? bundle.moduleCatalog.entries.filter((entry) => entry.module.id === target)
      : bundle.moduleCatalog.entries;

    const findings = entries.flatMap((entry) => {
      const issues: { code: string; message: string; target?: string }[] = [];
      if (!entry.registered) {
        issues.push({
          code: "MODULE_NOT_REGISTERED",
          message: `Module API token is not registered in DI: ${entry.module.moduleApiToken}`,
          target: entry.module.id,
        });
      }
      if (entry.module.publicMethods.length === 0) {
        issues.push({
          code: "EMPTY_PUBLIC_API",
          message: "Module has no public methods documented.",
          target: entry.module.id,
        });
      }
      return issues;
    });

    const result = createInspectionResult({
      inspectorId: this.id,
      passed: findings.length === 0,
      findings,
    });
    createInspectionCompletedEvent(result);
    return result;
  }
}
