import type { Identity } from "@server/security/identity";
import type { Permission } from "@server/security/permissions";
import type { RoleAssignment } from "@server/security/roles";
import type { SecurityPipelineContext } from "@server/security/shared";

/** Credentials presented for authentication — provider-agnostic shape. */
export interface AuthenticationCredentials {
  readonly type: "password" | "token" | "api_key" | "custom";
  readonly payload: Readonly<Record<string, unknown>>;
}

/** Result of a successful authentication attempt. */
export interface AuthenticationResult {
  readonly identity: Identity;
  readonly roles?: readonly RoleAssignment[];
  readonly permissions?: readonly Permission[];
  readonly sessionId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Resolves caller identity from incoming request context.
 * Implementations live outside the security layer (infrastructure/adapters).
 */
export interface IAuthenticationProvider {
  authenticate(
    context: SecurityPipelineContext,
    credentials: AuthenticationCredentials,
  ): Promise<AuthenticationResult>;

  resolve(context: SecurityPipelineContext): Promise<AuthenticationResult>;

  resolveIdentity(context: SecurityPipelineContext): Promise<Identity>;
}
