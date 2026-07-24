/** Gateway response metadata. */
export interface GatewayResponse {
  readonly requestId: string;
  readonly status: number;
  readonly endpointId: string;
  readonly version: string;
  readonly body?: unknown;
  readonly completedAt: string;
}

export function createGatewayResponse(input: {
  requestId: string;
  status: number;
  endpointId: string;
  version: string;
  body?: unknown;
}): GatewayResponse {
  return Object.freeze({
    requestId: input.requestId.trim(),
    status: input.status,
    endpointId: input.endpointId.trim(),
    version: input.version.trim(),
    body: input.body,
    completedAt: new Date().toISOString(),
  });
}
