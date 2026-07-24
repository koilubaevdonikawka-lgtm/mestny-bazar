import type { IRuleCatalog } from "@server/application/ai-rule-registry/contracts/rule-catalog.contract";
import type { Rule } from "@server/application/ai-rule-registry/models/rule.model";

/** Default in-memory rule catalog index. */
export class DefaultRuleCatalog implements IRuleCatalog {
  private readonly rules = new Map<string, Rule>();
  private readonly rulesByName = new Map<string, string>();
  private readonly rulesByCategory = new Map<string, Set<string>>();

  async register(rule: Rule): Promise<void> {
    const existing = this.rules.get(rule.ruleId);
    if (existing) {
      if (existing.name !== rule.name) {
        this.rulesByName.delete(existing.name);
      }
      if (existing.category !== rule.category) {
        this.removeFromCategory(existing.category, existing.ruleId);
      }
    }

    this.rules.set(rule.ruleId, rule);
    this.rulesByName.set(rule.name, rule.ruleId);
    this.addToCategory(rule.category, rule.ruleId);
  }

  async remove(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId.trim());
    if (!rule) {
      return;
    }
    this.rules.delete(rule.ruleId);
    this.rulesByName.delete(rule.name);
    this.removeFromCategory(rule.category, rule.ruleId);
  }

  async findById(ruleId: string): Promise<Rule | null> {
    return this.rules.get(ruleId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Rule | null> {
    const ruleId = this.rulesByName.get(name.trim());
    if (!ruleId) {
      return null;
    }
    return this.rules.get(ruleId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Rule[]> {
    const ruleIds = this.rulesByCategory.get(category.trim());
    if (!ruleIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...ruleIds]
        .map((ruleId) => this.rules.get(ruleId))
        .filter((rule): rule is Rule => rule !== undefined),
    );
  }

  async listAll(): Promise<readonly Rule[]> {
    return Object.freeze([...this.rules.values()]);
  }

  private addToCategory(category: string, ruleId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.rulesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(ruleId);
    this.rulesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, ruleId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.rulesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(ruleId);
    if (categorySet.size === 0) {
      this.rulesByCategory.delete(normalizedCategory);
    }
  }
}
