import type {
  ReleaseDescriptor,
  ReleaseManifest,
  ReleasePackage,
  ReleaseValidationResult,
  PublishResult,
} from "@server/platform/release/release/models";

/** Contract for release lifecycle orchestration. */
export interface IReleaseManager {
  createRelease(notes?: string): ReleaseDescriptor;
  validateRelease(releaseId: string): Promise<ReleaseValidationResult> | ReleaseValidationResult;
  packageRelease(releaseId: string): Promise<ReleasePackage> | ReleasePackage;
  publishRelease(releaseId: string, dryRun?: boolean): Promise<PublishResult> | PublishResult;
  generateManifest(releaseId: string): ReleaseManifest;
}
