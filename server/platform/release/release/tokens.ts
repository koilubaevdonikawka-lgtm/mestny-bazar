/** DI tokens for the release platform. */
export const ReleaseTokens = {
  ReleasePlatform: Symbol.for("release.platform"),
  ReleaseManager: Symbol.for("release.manager"),
  VersionManager: Symbol.for("release.versionManager"),
  ChangelogGenerator: Symbol.for("release.changelogGenerator"),
  ReleaseManifestGenerator: Symbol.for("release.manifestGenerator"),
  ReleasePackager: Symbol.for("release.packager"),
  ReleasePublisher: Symbol.for("release.publisher"),
  ReleaseValidator: Symbol.for("release.validator"),
} as const;

export type ReleaseToken = (typeof ReleaseTokens)[keyof typeof ReleaseTokens];
