import type { ReleasePackage } from "@server/platform/release/release/models";

/** Emitted when a release is packaged. */
export interface ReleasePackagedEvent {
  readonly type: "release.packaged";
  readonly releasePackage: ReleasePackage;
}

export function createReleasePackagedEvent(releasePackage: ReleasePackage): ReleasePackagedEvent {
  return Object.freeze({ type: "release.packaged", releasePackage });
}
