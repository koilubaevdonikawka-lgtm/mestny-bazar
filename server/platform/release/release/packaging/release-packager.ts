import type { IChangelogGenerator } from "@server/platform/release/release/contracts";
import type { IManifestGenerator } from "@server/platform/release/release/contracts";
import {
  createReleasePackage,
  type ReleaseDescriptor,
  type ReleasePackage,
} from "@server/platform/release/release/models";
import { createReleasePackagedEvent } from "@server/platform/release/release/events";

/** Prepares release package metadata without creating archive files. */
export class ReleasePackager {
  constructor(
    private readonly manifestGenerator: IManifestGenerator,
    private readonly changelogGenerator: IChangelogGenerator,
  ) {}

  async package(release: ReleaseDescriptor): Promise<ReleasePackage> {
    const manifest = this.manifestGenerator.generate(release.versionLabel);
    const changelog = await this.changelogGenerator.generate();

    const releasePackage = createReleasePackage({
      releaseId: release.id,
      version: release.versionLabel,
      manifest,
      changelog,
      artifacts: Object.freeze([
        "release-manifest.json",
        "changelog.json",
        "platform-metadata.json",
        "module-metadata.json",
        "provider-metadata.json",
      ]),
    });

    createReleasePackagedEvent(releasePackage);
    return releasePackage;
  }
}
