/** Result of a scaffolding operation. */
export interface ScaffoldResult {
  readonly templateId: string;
  readonly scaffoldedAt: string;
  readonly targetName: string;
  readonly files: readonly { readonly path: string; readonly content: string }[];
}

export function createScaffoldResult(input: {
  templateId: string;
  targetName: string;
  files: readonly { readonly path: string; readonly content: string }[];
}): ScaffoldResult {
  return Object.freeze({
    templateId: input.templateId.trim(),
    scaffoldedAt: new Date().toISOString(),
    targetName: input.targetName.trim(),
    files: Object.freeze(input.files.map((file) => Object.freeze({ ...file }))),
  });
}
