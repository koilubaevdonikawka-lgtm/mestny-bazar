import type { VersionDescriptor, VersionComparison } from "@server/platform/release/release/models";

/** Contract for semantic version management. */
export interface IVersionManager {
  currentVersion(): VersionDescriptor;
  nextVersion(bump?: "major" | "minor" | "patch"): VersionDescriptor;
  compareVersions(left: string, right: string): VersionComparison;
}
