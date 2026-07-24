import type { IGenerator } from "@server/platform/developer/developer/contracts";
import {
  createGenerationResult,
  type GenerationResult,
} from "@server/platform/developer/developer/models";
import { createGenerationCompletedEvent } from "@server/platform/developer/developer/events";

/** Generates business capability or process module boilerplate. */
export class ModuleGenerator implements IGenerator {
  readonly id = "module-generator";

  generate(target: string, options: Readonly<Record<string, string>> = {}): GenerationResult {
    const moduleKind = options.kind ?? "business-capability-module";
    const content = [
      `/** Generated ${moduleKind}: ${target} */`,
      `export interface I${toPascalCase(target)}Module {`,
      `  // Module API methods go here`,
      `}`,
      ``,
      `export class ${toPascalCase(target)}Module implements I${toPascalCase(target)}Module {}`,
    ].join("\n");

    const result = createGenerationResult({
      generatorId: this.id,
      artifactName: `${target}.module.ts`,
      content,
    });
    createGenerationCompletedEvent(result);
    return result;
  }
}

function toPascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
