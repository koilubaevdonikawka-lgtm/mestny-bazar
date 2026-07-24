import type { SDKClientKind } from "./sdk-client.model";

/** Descriptor for a registered SDK offering. */
export interface SDKDescriptor {
  readonly id: string;
  readonly name: string;
  readonly clientKind: SDKClientKind;
  readonly version: string;
  readonly contracts: readonly string[];
  readonly registeredAt: string;
}

export function createSDKDescriptor(input: {
  id: string;
  name: string;
  clientKind: SDKClientKind;
  version: string;
  contracts?: readonly string[];
}): SDKDescriptor {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    clientKind: input.clientKind,
    version: input.version.trim(),
    contracts: Object.freeze([...(input.contracts ?? [])]),
    registeredAt: new Date().toISOString(),
  });
}
