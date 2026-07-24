import type { ReleaseDescriptor } from "@server/platform/release/release/models";

/** Emitted when a release is created. */
export interface ReleaseCreatedEvent {
  readonly type: "release.created";
  readonly release: ReleaseDescriptor;
}

export function createReleaseCreatedEvent(release: ReleaseDescriptor): ReleaseCreatedEvent {
  return Object.freeze({ type: "release.created", release });
}
