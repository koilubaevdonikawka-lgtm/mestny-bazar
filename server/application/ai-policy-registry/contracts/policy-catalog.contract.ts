import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

export interface IPolicyCatalog {
  register(policy: Policy): Promise<void>;
  remove(policyId: string): Promise<void>;
  findById(policyId: string): Promise<Policy | null>;
  findByName(name: string): Promise<Policy | null>;
  findByCategory(category: string): Promise<readonly Policy[]>;
  listAll(): Promise<readonly Policy[]>;
}
