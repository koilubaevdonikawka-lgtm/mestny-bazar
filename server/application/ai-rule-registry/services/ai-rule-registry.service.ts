/**
 * AI Rule Registry — unified registry for AI rules.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IRuleCatalog } from "@server/application/ai-rule-registry/contracts/rule-catalog.contract";
import type { IRuleRepository } from "@server/application/ai-rule-registry/contracts/rule-repository.contract";
import type { IRuleSerializer } from "@server/application/ai-rule-registry/contracts/rule-serializer.contract";
import type { IRuleStatisticsProvider } from "@server/application/ai-rule-registry/contracts/rule-statistics-provider.contract";
import type { IRuleValidator } from "@server/application/ai-rule-registry/contracts/rule-validator.contract";
import {
  createRule,
  type DeleteRuleResult,
  type FindRuleByNameResult,
  type ListRulesByCategoryResult,
  type ListRulesResult,
  type RegisterRuleInput,
  type Rule,
  type RuleRegistryStatistics,
  type UpdateRuleInput,
} from "@server/application/ai-rule-registry/models/rule.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiRuleRegistryService {
  constructor(
    private readonly ruleRepository: IRuleRepository,
    private readonly ruleCatalog: IRuleCatalog,
    private readonly ruleValidator: IRuleValidator,
    private readonly ruleSerializer: IRuleSerializer,
    private readonly statisticsProvider: IRuleStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerRule(input: RegisterRuleInput): Promise<Rule> {
    const validation = await this.ruleValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.ruleRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Rule already exists with name: ${input.name.trim()}`);
    }

    const rule = createRule({
      ruleId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.ruleRepository.save(rule);
    await this.ruleCatalog.register(rule);
    return rule;
  }

  async getRule(ruleId: string): Promise<Rule | null> {
    return this.ruleRepository.findById(ruleId.trim());
  }

  async listRules(): Promise<ListRulesResult> {
    const rules = Object.freeze(
      [...(await this.ruleRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ rules, total: rules.length });
  }

  async updateRule(input: UpdateRuleInput): Promise<Rule> {
    const ruleId = input.ruleId.trim();
    const existing = await this.ruleRepository.findById(ruleId);
    if (!existing) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    const validation = await this.ruleValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.ruleRepository.findByName(input.name.trim());
      if (duplicate && duplicate.ruleId !== existing.ruleId) {
        throw new Error(`Rule already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createRule({
      ruleId: existing.ruleId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.ruleRepository.save(updated);
    await this.ruleCatalog.register(updated);
    return updated;
  }

  async deleteRule(ruleId: string): Promise<DeleteRuleResult> {
    const normalizedRuleId = ruleId.trim();
    const deleted = await this.ruleRepository.delete(normalizedRuleId);
    if (deleted) {
      await this.ruleCatalog.remove(normalizedRuleId);
    }
    return Object.freeze({ ruleId: normalizedRuleId, deleted });
  }

  async findRuleByName(name: string): Promise<FindRuleByNameResult> {
    const normalizedName = name.trim();
    const rule = await this.ruleRepository.findByName(normalizedName);
    return Object.freeze({ rule });
  }

  async listRulesByCategory(category: string): Promise<ListRulesByCategoryResult> {
    const normalizedCategory = category.trim();
    const rules = Object.freeze(
      [...(await this.ruleRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      rules,
      total: rules.length,
      category: normalizedCategory,
    });
  }

  async getRuleRegistryStatistics(): Promise<RuleRegistryStatistics> {
    const rules = await this.ruleRepository.findAll();
    const activeRules = rules.filter((rule) => rule.status === "active").length;
    const categories = Object.freeze([
      ...new Set(rules.map((rule) => rule.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalRules: rules.length,
      activeRules,
      categories,
    });
  }

  async serializeRule(rule: Rule): Promise<string> {
    return this.ruleSerializer.serialize(rule);
  }

  async deserializeRule(serialized: string): Promise<Rule> {
    return this.ruleSerializer.deserialize(serialized);
  }
}
