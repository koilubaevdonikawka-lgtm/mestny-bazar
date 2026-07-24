import type { IGenerator } from "@server/platform/developer/developer/contracts";
import {
  createGenerationResult,
  type GenerationResult,
} from "@server/platform/developer/developer/models";
import { createGenerationCompletedEvent } from "@server/platform/developer/developer/events";

/** Generates interface contract boilerplate. */
export class ContractGenerator implements IGenerator {
  readonly id = "contract-generator";

  generate(target: string): GenerationResult {
    const name = target.startsWith("I") ? target : `I${toPascalCase(target)}`;
    const content = [
      `/** Generated contract: ${name} */`,
      `export interface ${name} {`,
      `  // Contract methods go here`,
      `}`,
    ].join("\n");

    const result = createGenerationResult({
      generatorId: this.id,
      artifactName: `${name}.contract.ts`,
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
