import type { IGovernancePolicyCatalog } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-catalog.contract";
import type { GovernancePolicy } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

/** Default in-memory governance policy catalog index. */
export class DefaultGovernancePolicyCatalog implements IGovernancePolicyCatalog {
  private readonly governancePolicies = new Map<string, GovernancePolicy>();
  private readonly governancePoliciesByName = new Map<string, string>();
  private readonly governancePoliciesByCategory = new Map<string, Set<string>>();

  async register(governancePolicy: GovernancePolicy): Promise<void> {
    const existing = this.governancePolicies.get(governancePolicy.governancePolicyId);
    if (existing) {
      if (existing.name !== governancePolicy.name) {
        this.governancePoliciesByName.delete(existing.name);
      }
      if (existing.category !== governancePolicy.category) {
        this.removeFromCategory(existing.category, existing.governancePolicyId);
      }
    }

    this.governancePolicies.set(governancePolicy.governancePolicyId, governancePolicy);
    this.governancePoliciesByName.set(governancePolicy.name, governancePolicy.governancePolicyId);
    this.addToCategory(governancePolicy.category, governancePolicy.governancePolicyId);
  }

  async remove(governancePolicyId: string): Promise<void> {
    const governancePolicy = this.governancePolicies.get(governancePolicyId.trim());
    if (!governancePolicy) {
      return;
    }
    this.governancePolicies.delete(governancePolicy.governancePolicyId);
    this.governancePoliciesByName.delete(governancePolicy.name);
    this.removeFromCategory(governancePolicy.category, governancePolicy.governancePolicyId);
  }

  async findById(governancePolicyId: string): Promise<GovernancePolicy | null> {
    return this.governancePolicies.get(governancePolicyId.trim()) ?? null;
  }

  async findByName(name: string): Promise<GovernancePolicy | null> {
    const governancePolicyId = this.governancePoliciesByName.get(name.trim());
    if (!governancePolicyId) {
      return null;
    }
    return this.governancePolicies.get(governancePolicyId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly GovernancePolicy[]> {
    const governancePolicyIds = this.governancePoliciesByCategory.get(category.trim());
    if (!governancePolicyIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...governancePolicyIds]
        .map((governancePolicyId) => this.governancePolicies.get(governancePolicyId))
        .filter((governancePolicy): governancePolicy is GovernancePolicy => governancePolicy !== undefined),
    );
  }

  async listAll(): Promise<readonly GovernancePolicy[]> {
    return Object.freeze([...this.governancePolicies.values()]);
  }

  private addToCategory(category: string, governancePolicyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.governancePoliciesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(governancePolicyId);
    this.governancePoliciesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, governancePolicyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.governancePoliciesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(governancePolicyId);
    if (categorySet.size === 0) {
      this.governancePoliciesByCategory.delete(normalizedCategory);
    }
  }
}
