import type { IGenerator } from "@server/platform/developer/developer/contracts";
import {
  createGenerationResult,
  type GenerationResult,
} from "@server/platform/developer/developer/models";
import { createGenerationCompletedEvent } from "@server/platform/developer/developer/events";

/** Generates platform module boilerplate. */
export class PlatformGenerator implements IGenerator {
  readonly id = "platform-generator";

  generate(target: string): GenerationResult {
    const className = toPascalCase(target);
    const content = [
      `/** Generated platform module: ${target} */`,
      `export class ${className}Platform {`,
      `  // Platform facade methods go here`,
      `}`,
    ].join("\n");

    const result = createGenerationResult({
      generatorId: this.id,
      artifactName: `${target}-platform.ts`,
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
