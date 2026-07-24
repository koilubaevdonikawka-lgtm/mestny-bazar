import type { IPolicySetCatalog } from "@server/application/ai-policy-set-registry/contracts/policy-set-catalog.contract";
import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** Default in-memory policy set catalog index. */
export class DefaultPolicySetCatalog implements IPolicySetCatalog {
  private readonly policySets = new Map<string, PolicySet>();
  private readonly policySetsByName = new Map<string, string>();
  private readonly policySetsByCategory = new Map<string, Set<string>>();

  async register(policySet: PolicySet): Promise<void> {
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

  async remove(policySetId: string): Promise<void> {
    const policySet = this.policySets.get(policySetId.trim());
    if (!policySet) {
      return;
    }
    this.policySets.delete(policySet.policySetId);
    this.policySetsByName.delete(policySet.name);
    this.removeFromCategory(policySet.category, policySet.policySetId);
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

  async listAll(): Promise<readonly PolicySet[]> {
    return Object.freeze([...this.policySets.values()]);
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
