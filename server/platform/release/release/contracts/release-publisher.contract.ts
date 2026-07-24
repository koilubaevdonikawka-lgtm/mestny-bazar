import type { PublishResult } from "@server/platform/release/release/models";
import type { ReleasePackage } from "@server/platform/release/release/models";

/** Contract for release publishing (metadata only, no actual deployment). */
export interface IReleasePublisher {
  dryRun(releasePackage: ReleasePackage): PublishResult;
  publish(releasePackage: ReleasePackage): PublishResult;
  rollbackPreparation(releaseId: string): PublishResult;
}
