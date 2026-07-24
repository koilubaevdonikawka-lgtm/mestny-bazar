/** Gateway route mapping from path pattern to endpoint. */
export interface GatewayRoute {
  readonly id: string;
  readonly pattern: string;
  readonly endpointId: string;
  readonly version: string;
  readonly registeredAt: string;
}

export function createGatewayRoute(input: {
  id: string;
  pattern: string;
  endpointId: string;
  version: string;
}): GatewayRoute {
  return Object.freeze({
    id: input.id.trim(),
    pattern: input.pattern.trim(),
    endpointId: input.endpointId.trim(),
    version: input.version.trim(),
    registeredAt: new Date().toISOString(),
  });
}
