/** Discriminator for identity kinds within the security layer. */
export type IdentityType = "anonymous" | "authenticated" | "system" | "service";

/** Outcome of an authorization decision. */
export type AuthorizationDecision = "allow" | "deny";

/** Minimal request surface consumed by security middleware — transport-agnostic. */
export interface SecurityPipelineContext {
  readonly method: string;
  readonly path: string;
  readonly params: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, string | string[]>>;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly locale?: string;
  readonly tenantId?: string;
}
