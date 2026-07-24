import type { IRiskRuleRepository } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-repository.contract";
import type { RiskRule } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

/** In-memory risk rule store. */
export class RiskRuleRepository implements IRiskRuleRepository {
  private readonly riskRules = new Map<string, RiskRule>();
  private readonly riskRulesByName = new Map<string, string>();
  private readonly riskRulesByCategory = new Map<string, Set<string>>();

  async save(riskRule: RiskRule): Promise<void> {
    const existing = this.riskRules.get(riskRule.riskRuleId);
    if (existing) {
      if (existing.name !== riskRule.name) {
        this.riskRulesByName.delete(existing.name);
      }
      if (existing.category !== riskRule.category) {
        this.removeFromCategory(existing.category, existing.riskRuleId);
      }
    }

    this.riskRules.set(riskRule.riskRuleId, riskRule);
    this.riskRulesByName.set(riskRule.name, riskRule.riskRuleId);
    this.addToCategory(riskRule.category, riskRule.riskRuleId);
  }

  async findById(riskRuleId: string): Promise<RiskRule | null> {
    return this.riskRules.get(riskRuleId.trim()) ?? null;
  }

  async findByName(name: string): Promise<RiskRule | null> {
    const riskRuleId = this.riskRulesByName.get(name.trim());
    if (!riskRuleId) {
      return null;
    }
    return this.riskRules.get(riskRuleId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly RiskRule[]> {
    const riskRuleIds = this.riskRulesByCategory.get(category.trim());
    if (!riskRuleIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...riskRuleIds]
        .map((riskRuleId) => this.riskRules.get(riskRuleId))
        .filter((riskRule): riskRule is RiskRule => riskRule !== undefined),
    );
  }

  async findAll(): Promise<readonly RiskRule[]> {
    return Object.freeze([...this.riskRules.values()]);
  }

  async delete(riskRuleId: string): Promise<boolean> {
    const riskRule = await this.findById(riskRuleId);
    if (!riskRule) {
      return false;
    }
    this.riskRules.delete(riskRule.riskRuleId);
    this.riskRulesByName.delete(riskRule.name);
    this.removeFromCategory(riskRule.category, riskRule.riskRuleId);
    return true;
  }

  private addToCategory(category: string, riskRuleId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.riskRulesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(riskRuleId);
    this.riskRulesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, riskRuleId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.riskRulesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(riskRuleId);
    if (categorySet.size === 0) {
      this.riskRulesByCategory.delete(normalizedCategory);
    }
  }
}
