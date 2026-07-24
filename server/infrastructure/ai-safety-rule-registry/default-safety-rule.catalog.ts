import type { ISafetyRuleCatalog } from "@server/application/ai-safety-rule-registry/contracts/safety-rule-catalog.contract";
import type { SafetyRule } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

/** Default in-memory safety rule catalog index. */
export class DefaultSafetyRuleCatalog implements ISafetyRuleCatalog {
  private readonly safetyRules = new Map<string, SafetyRule>();
  private readonly safetyRulesByName = new Map<string, string>();
  private readonly safetyRulesByCategory = new Map<string, Set<string>>();

  async register(safetyRule: SafetyRule): Promise<void> {
    const existing = this.safetyRules.get(safetyRule.safetyRuleId);
    if (existing) {
      if (existing.name !== safetyRule.name) {
        this.safetyRulesByName.delete(existing.name);
      }
      if (existing.category !== safetyRule.category) {
        this.removeFromCategory(existing.category, existing.safetyRuleId);
      }
    }

    this.safetyRules.set(safetyRule.safetyRuleId, safetyRule);
    this.safetyRulesByName.set(safetyRule.name, safetyRule.safetyRuleId);
    this.addToCategory(safetyRule.category, safetyRule.safetyRuleId);
  }

  async remove(safetyRuleId: string): Promise<void> {
    const safetyRule = this.safetyRules.get(safetyRuleId.trim());
    if (!safetyRule) {
      return;
    }
    this.safetyRules.delete(safetyRule.safetyRuleId);
    this.safetyRulesByName.delete(safetyRule.name);
    this.removeFromCategory(safetyRule.category, safetyRule.safetyRuleId);
  }

  async findById(safetyRuleId: string): Promise<SafetyRule | null> {
    return this.safetyRules.get(safetyRuleId.trim()) ?? null;
  }

  async findByName(name: string): Promise<SafetyRule | null> {
    const safetyRuleId = this.safetyRulesByName.get(name.trim());
    if (!safetyRuleId) {
      return null;
    }
    return this.safetyRules.get(safetyRuleId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly SafetyRule[]> {
    const safetyRuleIds = this.safetyRulesByCategory.get(category.trim());
    if (!safetyRuleIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...safetyRuleIds]
        .map((safetyRuleId) => this.safetyRules.get(safetyRuleId))
        .filter((safetyRule): safetyRule is SafetyRule => safetyRule !== undefined),
    );
  }

  async listAll(): Promise<readonly SafetyRule[]> {
    return Object.freeze([...this.safetyRules.values()]);
  }

  private addToCategory(category: string, safetyRuleId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.safetyRulesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(safetyRuleId);
    this.safetyRulesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, safetyRuleId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.safetyRulesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(safetyRuleId);
    if (categorySet.size === 0) {
      this.safetyRulesByCategory.delete(normalizedCategory);
    }
  }
}
