export {
  type VersionDescriptor,
  type VersionComparison,
  createVersionDescriptor,
  formatVersion,
  parseVersion,
  compareVersionDescriptors,
} from "./version-descriptor.model";
export {
  type ReleaseStatus,
  type ReleaseDescriptor,
  createReleaseDescriptor,
} from "./release-descriptor.model";
export {
  type ChangelogCategory,
  type ChangelogEntry,
  createChangelogEntry,
} from "./changelog-entry.model";
export {
  type ReleaseManifest,
  createReleaseManifest,
} from "./release-manifest.model";
export {
  type ReleasePackage,
  createReleasePackage,
} from "./release-package.model";

export interface ReleaseValidationResult {
  readonly releaseId: string;
  readonly valid: boolean;
  readonly validatedAt: string;
  readonly checks: readonly { readonly name: string; readonly passed: boolean; readonly message: string }[];
}

export function createReleaseValidationResult(input: {
  releaseId: string;
  checks: readonly { readonly name: string; readonly passed: boolean; readonly message: string }[];
}): ReleaseValidationResult {
  const valid = input.checks.every((check) => check.passed);
  return Object.freeze({
    releaseId: input.releaseId.trim(),
    valid,
    validatedAt: new Date().toISOString(),
    checks: Object.freeze([...input.checks]),
  });
}

export interface PublishResult {
  readonly releaseId: string;
  readonly version: string;
  readonly dryRun: boolean;
  readonly publishedAt: string;
  readonly success: boolean;
  readonly message: string;
}

export function createPublishResult(input: {
  releaseId: string;
  version: string;
  dryRun: boolean;
  success: boolean;
  message: string;
}): PublishResult {
  return Object.freeze({
    releaseId: input.releaseId.trim(),
    version: input.version.trim(),
    dryRun: input.dryRun,
    publishedAt: new Date().toISOString(),
    success: input.success,
    message: input.message.trim(),
  });
}
