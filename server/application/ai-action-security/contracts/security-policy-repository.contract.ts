import type { SecurityPolicy } from "@server/application/ai-action-security/models/security-policy.model";

export interface ISecurityPolicyRepository {
  save(policy: SecurityPolicy): Promise<void>;
  findById(policyId: string): Promise<SecurityPolicy | null>;
  findByName(name: string): Promise<SecurityPolicy | null>;
  findAll(): Promise<readonly SecurityPolicy[]>;
  delete(policyId: string): Promise<boolean>;
}
