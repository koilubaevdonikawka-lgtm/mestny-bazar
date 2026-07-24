import type { PublishResult } from "@server/platform/release/release/models";

/** Emitted when a release publish operation completes. */
export interface ReleasePublishedEvent {
  readonly type: "release.published";
  readonly result: PublishResult;
}

export function createReleasePublishedEvent(result: PublishResult): ReleasePublishedEvent {
  return Object.freeze({ type: "release.published", result });
}
