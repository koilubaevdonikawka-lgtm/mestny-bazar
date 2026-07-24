export type SDKClientKind =
  | "typescript"
  | "javascript"
  | "rest"
  | "cli"
  | "webhook";

/** Registered external SDK client metadata. */
export interface SDKClient {
  readonly id: string;
  readonly name: string;
  readonly kind: SDKClientKind;
  readonly version: string;
  readonly registeredAt: string;
  readonly supportedPlatforms: readonly string[];
}

export function createSDKClient(input: {
  id: string;
  name: string;
  kind: SDKClientKind;
  version: string;
  supportedPlatforms?: readonly string[];
}): SDKClient {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    kind: input.kind,
    version: input.version.trim(),
    registeredAt: new Date().toISOString(),
    supportedPlatforms: Object.freeze([...(input.supportedPlatforms ?? [])]),
  });
}
