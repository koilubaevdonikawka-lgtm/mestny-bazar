/** Incoming gateway request metadata. */
export interface GatewayRequest {
  readonly id: string;
  readonly path: string;
  readonly method: string;
  readonly version: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: unknown;
  readonly receivedAt: string;
}

export function createGatewayRequest(input: {
  id?: string;
  path: string;
  method: string;
  version: string;
  headers?: Readonly<Record<string, string>>;
  body?: unknown;
}): GatewayRequest {
  return Object.freeze({
    id: input.id ?? `req-${Date.now()}`,
    path: input.path.trim(),
    method: input.method.trim().toUpperCase(),
    version: input.version.trim(),
    headers: Object.freeze({ ...(input.headers ?? {}) }),
    body: input.body,
    receivedAt: new Date().toISOString(),
  });
}
