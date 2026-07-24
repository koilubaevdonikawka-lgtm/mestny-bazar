import type { IGenerator } from "@server/platform/developer/developer/contracts";
import {
  createGenerationResult,
  type GenerationResult,
} from "@server/platform/developer/developer/models";
import { createGenerationCompletedEvent } from "@server/platform/developer/developer/events";

/** Generates infrastructure or provider adapter boilerplate. */
export class AdapterGenerator implements IGenerator {
  readonly id = "adapter-generator";

  generate(target: string, options: Readonly<Record<string, string>> = {}): GenerationResult {
    const contract = options.contract ?? "IProviderAdapter";
    const className = `${toPascalCase(target)}Adapter`;
    const content = [
      `import type { ${contract} } from "./contracts";`,
      ``,
      `/** Generated adapter: ${target} */`,
      `export class ${className} implements ${contract} {`,
      `  // Adapter implementation goes here`,
      `}`,
    ].join("\n");

    const result = createGenerationResult({
      generatorId: this.id,
      artifactName: `${target}.adapter.ts`,
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
