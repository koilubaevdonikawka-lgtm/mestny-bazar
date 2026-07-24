export type GatewayEndpointKind =
  | "public"
  | "sdk"
  | "webhook"
  | "internal-platform";

/** Registered public gateway endpoint metadata. */
export interface GatewayEndpoint {
  readonly id: string;
  readonly path: string;
  readonly method: string;
  readonly kind: GatewayEndpointKind;
  readonly version: string;
  readonly registeredAt: string;
  readonly description?: string;
}

export function createGatewayEndpoint(input: {
  id: string;
  path: string;
  method: string;
  kind: GatewayEndpointKind;
  version: string;
  description?: string;
}): GatewayEndpoint {
  return Object.freeze({
    id: input.id.trim(),
    path: input.path.trim(),
    method: input.method.trim().toUpperCase(),
    kind: input.kind,
    version: input.version.trim(),
    registeredAt: new Date().toISOString(),
    description: input.description?.trim() || undefined,
  });
}
