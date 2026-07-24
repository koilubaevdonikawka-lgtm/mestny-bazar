import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

export interface IPolicySetCatalog {
  register(policySet: PolicySet): Promise<void>;
  remove(policySetId: string): Promise<void>;
  findById(policySetId: string): Promise<PolicySet | null>;
  findByName(name: string): Promise<PolicySet | null>;
  findByCategory(category: string): Promise<readonly PolicySet[]>;
  listAll(): Promise<readonly PolicySet[]>;
}
