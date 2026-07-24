/** Semantic version descriptor. */
export interface VersionDescriptor {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease?: string;
}

export function createVersionDescriptor(input: {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}): VersionDescriptor {
  return Object.freeze({
    major: input.major,
    minor: input.minor,
    patch: input.patch,
    prerelease: input.prerelease?.trim() || undefined,
  });
}

export function formatVersion(version: VersionDescriptor): string {
  const base = `${version.major}.${version.minor}.${version.patch}`;
  return version.prerelease ? `${base}-${version.prerelease}` : base;
}

export function parseVersion(value: string): VersionDescriptor {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid version format: ${value}`);
  }
  return createVersionDescriptor({
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4],
  });
}

export type VersionComparison = -1 | 0 | 1;

/** Compares two semantic versions. */
export function compareVersionDescriptors(
  left: VersionDescriptor,
  right: VersionDescriptor,
): VersionComparison {
  if (left.major !== right.major) {
    return left.major > right.major ? 1 : -1;
  }
  if (left.minor !== right.minor) {
    return left.minor > right.minor ? 1 : -1;
  }
  if (left.patch !== right.patch) {
    return left.patch > right.patch ? 1 : -1;
  }
  if (left.prerelease === right.prerelease) {
    return 0;
  }
  if (!left.prerelease) {
    return 1;
  }
  if (!right.prerelease) {
    return -1;
  }
  return left.prerelease > right.prerelease ? 1 : -1;
}
