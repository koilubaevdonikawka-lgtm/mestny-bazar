import type { IReleaseManager } from "@server/platform/release/release/contracts";
import type { IChangelogGenerator } from "@server/platform/release/release/contracts";
import type {
  ChangelogEntry,
  PublishResult,
  ReleaseDescriptor,
  ReleaseManifest,
  ReleasePackage,
  ReleaseValidationResult,
} from "@server/platform/release/release/models";

/** Public release platform facade. */
export class ReleasePlatform {
  constructor(
    private readonly releaseManager: IReleaseManager,
    private readonly changelogGenerator: IChangelogGenerator,
  ) {}

  createRelease(notes?: string): ReleaseDescriptor {
    return this.releaseManager.createRelease(notes);
  }

  validateRelease(releaseId: string): Promise<ReleaseValidationResult> {
    return this.releaseManager.validateRelease(releaseId);
  }

  packageRelease(releaseId: string): Promise<ReleasePackage> {
    return this.releaseManager.packageRelease(releaseId);
  }

  publishRelease(releaseId: string, dryRun?: boolean): Promise<PublishResult> {
    return this.releaseManager.publishRelease(releaseId, dryRun);
  }

  generateManifest(releaseId: string): ReleaseManifest {
    return this.releaseManager.generateManifest(releaseId);
  }

  generateChangelog(): Promise<readonly ChangelogEntry[]> {
    return this.changelogGenerator.generate();
  }
}
