import type { IGenerator } from "@server/platform/developer/developer/contracts";
import {
  createGenerationResult,
  type GenerationResult,
} from "@server/platform/developer/developer/models";
import { createGenerationCompletedEvent } from "@server/platform/developer/developer/events";

/** Generates domain or platform event boilerplate. */
export class EventGenerator implements IGenerator {
  readonly id = "event-generator";

  generate(target: string): GenerationResult {
    const eventName = target.endsWith("Event") ? target : `${toPascalCase(target)}Event`;
    const typeLiteral = target.replace(/([a-z])([A-Z])/g, "$1.$2").toLowerCase();
    const content = [
      `/** Generated event: ${eventName} */`,
      `export interface ${eventName} {`,
      `  readonly type: "${typeLiteral}";`,
      `}`,
      ``,
      `export function create${eventName}(payload: Omit<${eventName}, "type">): ${eventName} {`,
      `  return Object.freeze({ type: "${typeLiteral}", ...payload });`,
      `}`,
    ].join("\n");

    const result = createGenerationResult({
      generatorId: this.id,
      artifactName: `${eventName}.event.ts`,
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
