/** Result of a code generation operation. */
export interface GenerationResult {
  readonly generatorId: string;
  readonly generatedAt: string;
  readonly artifactName: string;
  readonly content: string;
}

export function createGenerationResult(input: {
  generatorId: string;
  artifactName: string;
  content: string;
}): GenerationResult {
  return Object.freeze({
    generatorId: input.generatorId.trim(),
    generatedAt: new Date().toISOString(),
    artifactName: input.artifactName.trim(),
    content: input.content,
  });
}
