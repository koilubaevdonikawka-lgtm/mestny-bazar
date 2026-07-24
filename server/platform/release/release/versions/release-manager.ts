import type { IReleaseManager } from "@server/platform/release/release/contracts";
import type { IVersionManager } from "@server/platform/release/release/contracts";
import type { IManifestGenerator } from "@server/platform/release/release/contracts";
import type { IReleasePublisher } from "@server/platform/release/release/contracts";
import {
  createReleaseDescriptor,
  type ReleaseDescriptor,
  type ReleaseManifest,
  type ReleasePackage,
  type ReleaseValidationResult,
  type PublishResult,
  type ReleaseStatus,
} from "@server/platform/release/release/models";
import { createReleaseCreatedEvent } from "@server/platform/release/release/events";
import type { ReleaseValidator } from "@server/platform/release/release/validation";
import type { ReleasePackager } from "@server/platform/release/release/packaging";

/** Orchestrates the platform release lifecycle. */
export class ReleaseManager implements IReleaseManager {
  private readonly releases = new Map<string, ReleaseDescriptor>();
  private readonly packages = new Map<string, ReleasePackage>();

  constructor(
    private readonly versionManager: IVersionManager,
    private readonly manifestGenerator: IManifestGenerator,
    private readonly validator: ReleaseValidator,
    private readonly packager: ReleasePackager,
    private readonly publisher: IReleasePublisher,
  ) {}

  createRelease(notes?: string): ReleaseDescriptor {
    const version = this.versionManager.nextVersion("minor");
    const release = createReleaseDescriptor({ version, notes, status: "draft" });
    this.releases.set(release.id, release);
    createReleaseCreatedEvent(release);
    return release;
  }

  getRelease(releaseId: string): ReleaseDescriptor | undefined {
    return this.releases.get(releaseId.trim());
  }

  async validateRelease(releaseId: string): Promise<ReleaseValidationResult> {
    const release = this.requireRelease(releaseId);
    const result = await this.validator.validate(release);
    this.updateReleaseStatus(release.id, result.valid ? "validated" : "failed");
    return result;
  }

  async packageRelease(releaseId: string): Promise<ReleasePackage> {
    const release = this.requireRelease(releaseId);
    const releasePackage = await this.packager.package(release);
    this.packages.set(release.id, releasePackage);
    this.updateReleaseStatus(release.id, "packaged");
    return releasePackage;
  }

  async publishRelease(releaseId: string, dryRun = false): Promise<PublishResult> {
    const release = this.requireRelease(releaseId);
    const releasePackage =
      this.packages.get(release.id) ?? (await this.packageRelease(release.id));
    const result = dryRun
      ? this.publisher.dryRun(releasePackage)
      : this.publisher.publish(releasePackage);
    if (result.success && !dryRun) {
      this.updateReleaseStatus(release.id, "published");
    }
    return result;
  }

  generateManifest(releaseId: string): ReleaseManifest {
    const release = this.requireRelease(releaseId);
    return this.manifestGenerator.generate(release.versionLabel);
  }

  private requireRelease(releaseId: string): ReleaseDescriptor {
    const release = this.releases.get(releaseId.trim());
    if (!release) {
      throw new Error(`Release not found: ${releaseId}`);
    }
    return release;
  }

  private updateReleaseStatus(releaseId: string, status: ReleaseStatus): void {
    const release = this.releases.get(releaseId);
    if (!release) {
      return;
    }
    this.releases.set(releaseId, Object.freeze({ ...release, status }));
  }
}
