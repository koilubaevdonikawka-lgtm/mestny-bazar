import type { AuthorizationPolicy } from "@server/application/authorization-management/models/authorization.model";

export interface IAuthorizationPolicyRepository {
  save(policy: AuthorizationPolicy): Promise<void>;
  findById(policyId: string): Promise<AuthorizationPolicy | null>;
  findAll(): Promise<readonly AuthorizationPolicy[]>;
  findByResourcePattern(resource: string): Promise<readonly AuthorizationPolicy[]>;
  findByAction(action: string): Promise<readonly AuthorizationPolicy[]>;
}
