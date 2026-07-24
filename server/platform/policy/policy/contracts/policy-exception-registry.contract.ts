import type { PolicyException, PolicyExceptionKind } from "@server/platform/policy/policy/models";

/** Contract for policy exception registration (metadata only). */
export interface IPolicyExceptionRegistry {
  register(exception: PolicyException): PolicyException;
  get(exceptionId: string): PolicyException | undefined;
  list(kind?: PolicyExceptionKind): readonly PolicyException[];
  hasException(policyId: string): boolean;
}
