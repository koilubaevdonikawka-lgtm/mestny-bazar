import type { ReleaseManifest } from "./release-manifest.model";
import type { ChangelogEntry } from "./changelog-entry.model";

/** Release package metadata (no archive files). */
export interface ReleasePackage {
  readonly id: string;
  readonly releaseId: string;
  readonly version: string;
  readonly packagedAt: string;
  readonly manifest: ReleaseManifest;
  readonly changelog: readonly ChangelogEntry[];
  readonly artifacts: readonly string[];
}

export function createReleasePackage(input: {
  id?: string;
  releaseId: string;
  version: string;
  manifest: ReleaseManifest;
  changelog: readonly ChangelogEntry[];
  artifacts?: readonly string[];
}): ReleasePackage {
  return Object.freeze({
    id: input.id ?? `package-${Date.now()}`,
    releaseId: input.releaseId.trim(),
    version: input.version.trim(),
    packagedAt: new Date().toISOString(),
    manifest: input.manifest,
    changelog: Object.freeze([...input.changelog]),
    artifacts: Object.freeze([
      ...(input.artifacts ?? [
        "release-manifest.json",
        "changelog.json",
        "platform-metadata.json",
      ]),
    ]),
  });
}
