import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

export interface IPolicySetRepository {
  save(policySet: PolicySet): Promise<void>;
  findById(policySetId: string): Promise<PolicySet | null>;
  findByName(name: string): Promise<PolicySet | null>;
  findByCategory(category: string): Promise<readonly PolicySet[]>;
  findAll(): Promise<readonly PolicySet[]>;
  delete(policySetId: string): Promise<boolean>;
}
