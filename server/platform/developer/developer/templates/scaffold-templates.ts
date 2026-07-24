export interface ScaffoldTemplate {
  readonly id: string;
  readonly description: string;
  render(targetName: string): readonly { readonly path: string; readonly content: string }[];
}

function toPascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Business Capability Module scaffold template. */
export const businessCapabilityModuleTemplate: ScaffoldTemplate = Object.freeze({
  id: "business-capability-module",
  description: "Scaffold for a Business Capability Module (BCM).",
  render(targetName: string) {
    const className = toPascalCase(targetName);
    return Object.freeze([
      {
        path: `server/modules/${targetName}/${targetName}.module.ts`,
        content: [
          `/** ${className} Business Capability Module */`,
          `export interface I${className}Module {}`,
          `export class ${className}Module implements I${className}Module {}`,
        ].join("\n"),
      },
      {
        path: `server/modules/${targetName}/index.ts`,
        content: `export { ${className}Module, type I${className}Module } from "./${targetName}.module";`,
      },
    ]);
  },
});

/** Business Process Module scaffold template. */
export const businessProcessModuleTemplate: ScaffoldTemplate = Object.freeze({
  id: "business-process-module",
  description: "Scaffold for a Business Process Module (BPM).",
  render(targetName: string) {
    const className = toPascalCase(targetName);
    return Object.freeze([
      {
        path: `server/processes/${targetName}/${targetName}.process.ts`,
        content: [
          `/** ${className} Business Process Module */`,
          `export interface I${className}Process {}`,
          `export class ${className}Process implements I${className}Process {}`,
        ].join("\n"),
      },
    ]);
  },
});

/** Platform Module scaffold template. */
export const platformModuleTemplate: ScaffoldTemplate = Object.freeze({
  id: "platform-module",
  description: "Scaffold for a Platform Module.",
  render(targetName: string) {
    const className = toPascalCase(targetName);
    return Object.freeze([
      {
        path: `server/platform/${targetName}/${targetName}/${targetName}-platform.ts`,
        content: [
          `/** ${className} Platform */`,
          `export class ${className}Platform {}`,
        ].join("\n"),
      },
      {
        path: `server/platform/${targetName}/${targetName}/tokens.ts`,
        content: [
          `export const ${className}Tokens = {`,
          `  Platform: Symbol.for("${targetName}.platform"),`,
          `} as const;`,
        ].join("\n"),
      },
    ]);
  },
});

/** Infrastructure Adapter scaffold template. */
export const infrastructureAdapterTemplate: ScaffoldTemplate = Object.freeze({
  id: "infrastructure-adapter",
  description: "Scaffold for an Infrastructure Adapter.",
  render(targetName: string) {
    const className = toPascalCase(targetName);
    return Object.freeze([
      {
        path: `server/infrastructure/${targetName}/${targetName}.adapter.ts`,
        content: [
          `/** ${className} Infrastructure Adapter */`,
          `export class ${className}Adapter {}`,
        ].join("\n"),
      },
    ]);
  },
});

/** Provider Adapter scaffold template. */
export const providerAdapterTemplate: ScaffoldTemplate = Object.freeze({
  id: "provider-adapter",
  description: "Scaffold for a Provider Adapter.",
  render(targetName: string) {
    const className = toPascalCase(targetName);
    return Object.freeze([
      {
        path: `server/platform/integration/integration/adapters/${targetName}.adapter.ts`,
        content: [
          `/** ${className} Provider Adapter */`,
          `export class ${className}Adapter {}`,
        ].join("\n"),
      },
    ]);
  },
});

export const SCAFFOLD_TEMPLATES: readonly ScaffoldTemplate[] = Object.freeze([
  businessCapabilityModuleTemplate,
  businessProcessModuleTemplate,
  platformModuleTemplate,
  infrastructureAdapterTemplate,
  providerAdapterTemplate,
]);
