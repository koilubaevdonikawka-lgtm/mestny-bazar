import type { SecurityContext } from "@server/security/context";
import type { SecurityPipelineContext } from "@server/security/shared";

/** Pipeline context enriched with an immutable security snapshot. */
export interface SecurePipelineContext extends SecurityPipelineContext {
  readonly security: SecurityContext;
}

export type SecurityNextHandler = (
  context: SecurePipelineContext,
) => Promise<SecurePipelineContext>;

export type SecurityMiddlewareHandler = (
  context: SecurePipelineContext,
  next: SecurityNextHandler,
) => Promise<SecurePipelineContext>;

/** Converts a base pipeline context into a secure pipeline context. */
export function toSecurePipelineContext(
  context: SecurityPipelineContext,
  security: SecurityContext,
): SecurePipelineContext {
  return Object.freeze({
    ...context,
    security,
  });
}

/** Reads a header value case-insensitively. */
export function readHeader(
  headers: Readonly<Record<string, string>>,
  name: string,
): string | undefined {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) {
      return value;
    }
  }
  return undefined;
}
