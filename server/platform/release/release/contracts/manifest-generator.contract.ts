import type { ReleaseManifest } from "@server/platform/release/release/models";

/** Contract for release manifest generation. */
export interface IManifestGenerator {
  generate(version: string): Promise<ReleaseManifest> | ReleaseManifest;
}
