import type { ReleaseValidationResult } from "@server/platform/release/release/models";

/** Emitted when a release validation completes. */
export interface ReleaseValidatedEvent {
  readonly type: "release.validated";
  readonly result: ReleaseValidationResult;
}

export function createReleaseValidatedEvent(result: ReleaseValidationResult): ReleaseValidatedEvent {
  return Object.freeze({ type: "release.validated", result });
}
