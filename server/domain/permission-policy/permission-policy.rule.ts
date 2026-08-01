import type { PermissionContext, PermissionResult } from "@server/ports/permission-policy.port";

export interface PermissionPolicyRule {
  /** Lower values run first. Order is defined per rule, composed in DI Container. */
  readonly order: number;
  /**
   * When false, an allowed result continues the chain (for global guard rules).
   * Defaults to true — terminal rules stop after allowing.
   */
  readonly terminal?: boolean;
  applies(context: PermissionContext): boolean;
  evaluate(context: PermissionContext): PermissionResult;
}
