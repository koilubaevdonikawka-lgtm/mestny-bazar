import type { PolicyScope, PolicyScopeContext } from "@server/platform/policy/policy/models";

/** Contract for policy scope resolution (metadata only). */
export interface IScopeResolver {
  resolve(scope: PolicyScope): PolicyScopeContext;
  resolveAll(): readonly PolicyScopeContext[];
}
