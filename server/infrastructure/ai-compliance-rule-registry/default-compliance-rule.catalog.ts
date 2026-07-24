import type { IComplianceRuleCatalog } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-catalog.contract";
import type { ComplianceRule } from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";

/** Default in-memory compliance rule catalog index. */
export class DefaultComplianceRuleCatalog implements IComplianceRuleCatalog {
  private readonly complianceRules = new Map<string, ComplianceRule>();
  private readonly complianceRulesByName = new Map<string, string>();
  private readonly complianceRulesByCategory = new Map<string, Set<string>>();

  async register(complianceRule: ComplianceRule): Promise<void> {
    const existing = this.complianceRules.get(complianceRule.complianceRuleId);
    if (existing) {
      if (existing.name !== complianceRule.name) {
        this.complianceRulesByName.delete(existing.name);
      }
      if (existing.category !== complianceRule.category) {
        this.removeFromCategory(existing.category, existing.complianceRuleId);
      }
    }

    this.complianceRules.set(complianceRule.complianceRuleId, complianceRule);
    this.complianceRulesByName.set(complianceRule.name, complianceRule.complianceRuleId);
    this.addToCategory(complianceRule.category, complianceRule.complianceRuleId);
  }

  async remove(complianceRuleId: string): Promise<void> {
    const complianceRule = this.complianceRules.get(complianceRuleId.trim());
    if (!complianceRule) {
      return;
    }
    this.complianceRules.delete(complianceRule.complianceRuleId);
    this.complianceRulesByName.delete(complianceRule.name);
    this.removeFromCategory(complianceRule.category, complianceRule.complianceRuleId);
  }

  async findById(complianceRuleId: string): Promise<ComplianceRule | null> {
    return this.complianceRules.get(complianceRuleId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ComplianceRule | null> {
    const complianceRuleId = this.complianceRulesByName.get(name.trim());
    if (!complianceRuleId) {
      return null;
    }
    return this.complianceRules.get(complianceRuleId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ComplianceRule[]> {
    const complianceRuleIds = this.complianceRulesByCategory.get(category.trim());
    if (!complianceRuleIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...complianceRuleIds]
        .map((complianceRuleId) => this.complianceRules.get(complianceRuleId))
        .filter((complianceRule): complianceRule is ComplianceRule => complianceRule !== undefined),
    );
  }

  async listAll(): Promise<readonly ComplianceRule[]> {
    return Object.freeze([...this.complianceRules.values()]);
  }

  private addToCategory(category: string, complianceRuleId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.complianceRulesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(complianceRuleId);
    this.complianceRulesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, complianceRuleId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.complianceRulesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(complianceRuleId);
    if (categorySet.size === 0) {
      this.complianceRulesByCategory.delete(normalizedCategory);
    }
  }
}
