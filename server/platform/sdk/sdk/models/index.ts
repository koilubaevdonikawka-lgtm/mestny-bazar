import type { SDKManifest } from "./sdk-manifest.model";

export {
  type SDKClientKind,
  type SDKClient,
  createSDKClient,
} from "./sdk-client.model";
export {
  type SDKVersion,
  createSDKVersion,
  parseSDKVersion,
} from "./sdk-version.model";
export {
  type SDKDescriptor,
  createSDKDescriptor,
} from "./sdk-descriptor.model";
export {
  type SDKManifest,
  createSDKManifest,
} from "./sdk-manifest.model";
export {
  type SerializationFormat,
  type SerializationProfile,
  createSerializationProfile,
} from "./serialization-profile.model";

export interface SDKCompatibilityResult {
  readonly clientId: string;
  readonly compatible: boolean;
  readonly checkedAt: string;
  readonly findings: readonly { readonly area: string; readonly compatible: boolean; readonly message: string }[];
}

export function createSDKCompatibilityResult(input: {
  clientId: string;
  findings: readonly { readonly area: string; readonly compatible: boolean; readonly message: string }[];
}): SDKCompatibilityResult {
  return Object.freeze({
    clientId: input.clientId.trim(),
    compatible: input.findings.every((finding) => finding.compatible),
    checkedAt: new Date().toISOString(),
    findings: Object.freeze([...input.findings]),
  });
}

export interface SDKGenerationResult {
  readonly clientId: string;
  readonly manifest: SDKManifest;
  readonly generatedAt: string;
}

export function createSDKGenerationResult(input: {
  clientId: string;
  manifest: SDKManifest;
}): SDKGenerationResult {
  return Object.freeze({
    clientId: input.clientId.trim(),
    manifest: input.manifest,
    generatedAt: new Date().toISOString(),
  });
}
