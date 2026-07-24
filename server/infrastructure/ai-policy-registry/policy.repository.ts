import type { IPolicyRepository } from "@server/application/ai-policy-registry/contracts/policy-repository.contract";
import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

/** In-memory policy store. */
export class PolicyRepository implements IPolicyRepository {
  private readonly policies = new Map<string, Policy>();
  private readonly policiesByName = new Map<string, string>();
  private readonly policiesByCategory = new Map<string, Set<string>>();

  async save(policy: Policy): Promise<void> {
    const existing = this.policies.get(policy.policyId);
    if (existing) {
      if (existing.name !== policy.name) {
        this.policiesByName.delete(existing.name);
      }
      if (existing.category !== policy.category) {
        this.removeFromCategory(existing.category, existing.policyId);
      }
    }

    this.policies.set(policy.policyId, policy);
    this.policiesByName.set(policy.name, policy.policyId);
    this.addToCategory(policy.category, policy.policyId);
  }

  async findById(policyId: string): Promise<Policy | null> {
    return this.policies.get(policyId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Policy | null> {
    const policyId = this.policiesByName.get(name.trim());
    if (!policyId) {
      return null;
    }
    return this.policies.get(policyId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Policy[]> {
    const policyIds = this.policiesByCategory.get(category.trim());
    if (!policyIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...policyIds]
        .map((policyId) => this.policies.get(policyId))
        .filter((policy): policy is Policy => policy !== undefined),
    );
  }

  async findAll(): Promise<readonly Policy[]> {
    return Object.freeze([...this.policies.values()]);
  }

  async delete(policyId: string): Promise<boolean> {
    const policy = await this.findById(policyId);
    if (!policy) {
      return false;
    }
    this.policies.delete(policy.policyId);
    this.policiesByName.delete(policy.name);
    this.removeFromCategory(policy.category, policy.policyId);
    return true;
  }

  private addToCategory(category: string, policyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.policiesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(policyId);
    this.policiesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, policyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.policiesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(policyId);
    if (categorySet.size === 0) {
      this.policiesByCategory.delete(normalizedCategory);
    }
  }
}
