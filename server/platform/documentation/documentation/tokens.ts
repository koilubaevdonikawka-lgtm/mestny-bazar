/** DI tokens for the documentation platform. */
export const DocumentationTokens = {
  DocumentationPlatform: Symbol.for("documentation.platform"),
  ArchitectureRegistry: Symbol.for("documentation.architectureRegistry"),
  DocumentationGenerator: Symbol.for("documentation.documentationGenerator"),
  ArchitectureValidator: Symbol.for("documentation.architectureValidator"),
  MarkdownExporter: Symbol.for("documentation.markdownExporter"),
  JsonExporter: Symbol.for("documentation.jsonExporter"),
  ArchitectureSnapshotExporter: Symbol.for("documentation.architectureSnapshotExporter"),
} as const;

export type DocumentationToken = (typeof DocumentationTokens)[keyof typeof DocumentationTokens];
