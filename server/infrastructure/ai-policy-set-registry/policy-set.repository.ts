import type { IPolicySetRepository } from "@server/application/ai-policy-set-registry/contracts/policy-set-repository.contract";
import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** In-memory policy set store. */
export class PolicySetRepository implements IPolicySetRepository {
  private readonly policySets = new Map<string, PolicySet>();
  private readonly policySetsByName = new Map<string, string>();
  private readonly policySetsByCategory = new Map<string, Set<string>>();

  async save(policySet: PolicySet): Promise<void> {
    const existing = this.policySets.get(policySet.policySetId);
    if (existing) {
      if (existing.name !== policySet.name) {
        this.policySetsByName.delete(existing.name);
      }
      if (existing.category !== policySet.category) {
        this.removeFromCategory(existing.category, existing.policySetId);
      }
    }

    this.policySets.set(policySet.policySetId, policySet);
    this.policySetsByName.set(policySet.name, policySet.policySetId);
    this.addToCategory(policySet.category, policySet.policySetId);
  }

  async findById(policySetId: string): Promise<PolicySet | null> {
    return this.policySets.get(policySetId.trim()) ?? null;
  }

  async findByName(name: string): Promise<PolicySet | null> {
    const policySetId = this.policySetsByName.get(name.trim());
    if (!policySetId) {
      return null;
    }
    return this.policySets.get(policySetId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly PolicySet[]> {
    const policySetIds = this.policySetsByCategory.get(category.trim());
    if (!policySetIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...policySetIds]
        .map((policySetId) => this.policySets.get(policySetId))
        .filter((policySet): policySet is PolicySet => policySet !== undefined),
    );
  }

  async findAll(): Promise<readonly PolicySet[]> {
    return Object.freeze([...this.policySets.values()]);
  }

  async delete(policySetId: string): Promise<boolean> {
    const policySet = await this.findById(policySetId);
    if (!policySet) {
      return false;
    }
    this.policySets.delete(policySet.policySetId);
    this.policySetsByName.delete(policySet.name);
    this.removeFromCategory(policySet.category, policySet.policySetId);
    return true;
  }

  private addToCategory(category: string, policySetId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.policySetsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(policySetId);
    this.policySetsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, policySetId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.policySetsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(policySetId);
    if (categorySet.size === 0) {
      this.policySetsByCategory.delete(normalizedCategory);
    }
  }
}
