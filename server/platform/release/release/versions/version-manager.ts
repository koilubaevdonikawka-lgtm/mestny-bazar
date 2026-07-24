import type { IVersionManager } from "@server/platform/release/release/contracts";
import {
  compareVersionDescriptors,
  createVersionDescriptor,
  parseVersion,
  type VersionComparison,
  type VersionDescriptor,
} from "@server/platform/release/release/models";

const DEFAULT_VERSION = createVersionDescriptor({ major: 1, minor: 0, patch: 0 });

/** Manages semantic versioning for platform releases. */
export class VersionManager implements IVersionManager {
  private current = DEFAULT_VERSION;

  currentVersion(): VersionDescriptor {
    return this.current;
  }

  nextVersion(bump: "major" | "minor" | "patch" = "patch"): VersionDescriptor {
    const next = createVersionDescriptor({
      major: bump === "major" ? this.current.major + 1 : this.current.major,
      minor:
        bump === "major"
          ? 0
          : bump === "minor"
            ? this.current.minor + 1
            : this.current.minor,
      patch:
        bump === "patch"
          ? this.current.patch + 1
          : bump === "minor" || bump === "major"
            ? 0
            : this.current.patch,
    });
    this.current = next;
    return next;
  }

  compareVersions(left: string, right: string): VersionComparison {
    return compareVersionDescriptors(parseVersion(left), parseVersion(right));
  }

  setCurrentVersion(version: VersionDescriptor): void {
    this.current = version;
  }
}
