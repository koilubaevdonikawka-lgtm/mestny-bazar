import type { GenerationResult } from "@server/platform/developer/developer/models";

/** Contract for code generators. */
export interface IGenerator {
  readonly id: string;
  generate(target: string, options?: Readonly<Record<string, string>>): GenerationResult;
}
