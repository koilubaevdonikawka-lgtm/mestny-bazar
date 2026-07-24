/** Platform release manifest with module, provider and dependency sections. */
export interface ReleaseManifest {
  readonly id: string;
  readonly version: string;
  readonly generatedAt: string;
  readonly platformManifest: Readonly<Record<string, unknown>>;
  readonly moduleManifest: Readonly<Record<string, unknown>>;
  readonly providerManifest: Readonly<Record<string, unknown>>;
  readonly dependencyManifest: Readonly<Record<string, unknown>>;
}

export function createReleaseManifest(input: {
  id?: string;
  version: string;
  platformManifest: Readonly<Record<string, unknown>>;
  moduleManifest: Readonly<Record<string, unknown>>;
  providerManifest: Readonly<Record<string, unknown>>;
  dependencyManifest: Readonly<Record<string, unknown>>;
}): ReleaseManifest {
  return Object.freeze({
    id: input.id ?? `manifest-${Date.now()}`,
    version: input.version.trim(),
    generatedAt: new Date().toISOString(),
    platformManifest: Object.freeze({ ...input.platformManifest }),
    moduleManifest: Object.freeze({ ...input.moduleManifest }),
    providerManifest: Object.freeze({ ...input.providerManifest }),
    dependencyManifest: Object.freeze({ ...input.dependencyManifest }),
  });
}
