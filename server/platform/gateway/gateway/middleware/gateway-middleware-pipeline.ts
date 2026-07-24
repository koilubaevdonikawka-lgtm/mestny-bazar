import type { GatewayRequest } from "@server/platform/gateway/gateway/models";

export type MiddlewareKind =
  | "authentication"
  | "authorization"
  | "rate-limit"
  | "validation"
  | "logging"
  | "tracing"
  | "idempotency";

export interface MiddlewareDescriptor {
  readonly kind: MiddlewareKind;
  readonly enabled: boolean;
  readonly order: number;
}

const DEFAULT_MIDDLEWARE: readonly MiddlewareDescriptor[] = Object.freeze([
  { kind: "tracing", enabled: true, order: 1 },
  { kind: "logging", enabled: true, order: 2 },
  { kind: "authentication", enabled: true, order: 3 },
  { kind: "authorization", enabled: true, order: 4 },
  { kind: "rate-limit", enabled: true, order: 5 },
  { kind: "validation", enabled: true, order: 6 },
  { kind: "idempotency", enabled: true, order: 7 },
]);

/** Gateway middleware pipeline metadata (no business logic execution). */
export class GatewayMiddlewarePipeline {
  private readonly middleware = [...DEFAULT_MIDDLEWARE];

  listMiddleware(): readonly MiddlewareDescriptor[] {
    return Object.freeze([...this.middleware].sort((a, b) => a.order - b.order));
  }

  applyMetadata(request: GatewayRequest): readonly string[] {
    return Object.freeze(
      this.listMiddleware()
        .filter((entry) => entry.enabled)
        .map((entry) => `${entry.kind}:${request.id}`),
    );
  }
}
