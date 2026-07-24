import type { IReleasePublisher } from "@server/platform/release/release/contracts";
import {
  createPublishResult,
  type PublishResult,
  type ReleasePackage,
} from "@server/platform/release/release/models";
import { createReleasePublishedEvent } from "@server/platform/release/release/events";

/** Prepares release publishing metadata without actual deployment. */
export class ReleasePublisher implements IReleasePublisher {
  private readonly published = new Map<string, PublishResult>();

  dryRun(releasePackage: ReleasePackage): PublishResult {
    const result = createPublishResult({
      releaseId: releasePackage.releaseId,
      version: releasePackage.version,
      dryRun: true,
      success: true,
      message: `Dry run successful for release ${releasePackage.version}. No deployment performed.`,
    });
    createReleasePublishedEvent(result);
    return result;
  }

  publish(releasePackage: ReleasePackage): PublishResult {
    const result = createPublishResult({
      releaseId: releasePackage.releaseId,
      version: releasePackage.version,
      dryRun: false,
      success: true,
      message: `Release ${releasePackage.version} publish prepared (metadata only, no deployment).`,
    });
    this.published.set(releasePackage.releaseId, result);
    createReleasePublishedEvent(result);
    return result;
  }

  rollbackPreparation(releaseId: string): PublishResult {
    const previous = this.published.get(releaseId.trim());
    const result = createPublishResult({
      releaseId,
      version: previous?.version ?? "unknown",
      dryRun: true,
      success: Boolean(previous),
      message: previous
        ? `Rollback preparation completed for release ${previous.version}.`
        : `No published release found for rollback preparation: ${releaseId}.`,
    });
    createReleasePublishedEvent(result);
    return result;
  }

  getPublished(releaseId: string): PublishResult | undefined {
    return this.published.get(releaseId.trim());
  }
}
