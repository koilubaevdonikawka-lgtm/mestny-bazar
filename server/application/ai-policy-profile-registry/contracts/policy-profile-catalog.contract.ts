import type { PolicyProfile } from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

export interface IPolicyProfileCatalog {
  register(policyProfile: PolicyProfile): Promise<void>;
  remove(policyProfileId: string): Promise<void>;
  findById(policyProfileId: string): Promise<PolicyProfile | null>;
  findByName(name: string): Promise<PolicyProfile | null>;
  findByCategory(category: string): Promise<readonly PolicyProfile[]>;
  listAll(): Promise<readonly PolicyProfile[]>;
}
