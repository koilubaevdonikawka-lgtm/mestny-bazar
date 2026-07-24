import type { VersionDescriptor } from "./version-descriptor.model";

export type ReleaseStatus =
  | "draft"
  | "validated"
  | "packaged"
  | "published"
  | "failed";

/** Descriptor for a platform release. */
export interface ReleaseDescriptor {
  readonly id: string;
  readonly version: VersionDescriptor;
  readonly versionLabel: string;
  readonly status: ReleaseStatus;
  readonly createdAt: string;
  readonly notes?: string;
}

export function createReleaseDescriptor(input: {
  id?: string;
  version: VersionDescriptor;
  status?: ReleaseStatus;
  notes?: string;
}): ReleaseDescriptor {
  const versionLabel = `${input.version.major}.${input.version.minor}.${input.version.patch}${
    input.version.prerelease ? `-${input.version.prerelease}` : ""
  }`;
  return Object.freeze({
    id: input.id ?? `release-${Date.now()}`,
    version: input.version,
    versionLabel,
    status: input.status ?? "draft",
    createdAt: new Date().toISOString(),
    notes: input.notes?.trim() || undefined,
  });
}
