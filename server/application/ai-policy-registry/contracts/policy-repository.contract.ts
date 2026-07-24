import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

export interface IPolicyRepository {
  save(policy: Policy): Promise<void>;
  findById(policyId: string): Promise<Policy | null>;
  findByName(name: string): Promise<Policy | null>;
  findByCategory(category: string): Promise<readonly Policy[]>;
  findAll(): Promise<readonly Policy[]>;
  delete(policyId: string): Promise<boolean>;
}
