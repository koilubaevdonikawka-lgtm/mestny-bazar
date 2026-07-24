/**
 * AI Risk Rule Registry — unified registry for AI risk rules.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IRiskRuleCatalog } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-catalog.contract";
import type { IRiskRuleRepository } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-repository.contract";
import type { IRiskRuleSerializer } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-serializer.contract";
import type { IRiskRuleStatisticsProvider } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-statistics-provider.contract";
import type { IRiskRuleValidator } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-validator.contract";
import {
  createRiskRule,
  type DeleteRiskRuleResult,
  type FindRiskRuleByNameResult,
  type ListRiskRulesByCategoryResult,
  type ListRiskRulesResult,
  type RegisterRiskRuleInput,
  type RiskRule,
  type RiskRuleRegistryStatistics,
  type UpdateRiskRuleInput,
} from "@server/application/ai-risk-rule-registry/models/risk-rule.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiRiskRuleRegistryService {
  constructor(
    private readonly riskRuleRepository: IRiskRuleRepository,
    private readonly riskRuleCatalog: IRiskRuleCatalog,
    private readonly riskRuleValidator: IRiskRuleValidator,
    private readonly riskRuleSerializer: IRiskRuleSerializer,
    private readonly statisticsProvider: IRiskRuleStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerRiskRule(input: RegisterRiskRuleInput): Promise<RiskRule> {
    const validation = await this.riskRuleValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.riskRuleRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Risk rule already exists with name: ${input.name.trim()}`);
    }

    const riskRule = createRiskRule({
      riskRuleId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.riskRuleRepository.save(riskRule);
    await this.riskRuleCatalog.register(riskRule);
    return riskRule;
  }

  async getRiskRule(riskRuleId: string): Promise<RiskRule | null> {
    return this.riskRuleRepository.findById(riskRuleId.trim());
  }

  async listRiskRules(): Promise<ListRiskRulesResult> {
    const riskRules = Object.freeze(
      [...(await this.riskRuleRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ riskRules, total: riskRules.length });
  }

  async updateRiskRule(input: UpdateRiskRuleInput): Promise<RiskRule> {
    const riskRuleId = input.riskRuleId.trim();
    const existing = await this.riskRuleRepository.findById(riskRuleId);
    if (!existing) {
      throw new Error(`Risk rule not found: ${riskRuleId}`);
    }

    const validation = await this.riskRuleValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.riskRuleRepository.findByName(input.name.trim());
      if (duplicate && duplicate.riskRuleId !== existing.riskRuleId) {
        throw new Error(`Risk rule already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createRiskRule({
      riskRuleId: existing.riskRuleId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.riskRuleRepository.save(updated);
    await this.riskRuleCatalog.register(updated);
    return updated;
  }

  async deleteRiskRule(riskRuleId: string): Promise<DeleteRiskRuleResult> {
    const normalizedRiskRuleId = riskRuleId.trim();
    const deleted = await this.riskRuleRepository.delete(normalizedRiskRuleId);
    if (deleted) {
      await this.riskRuleCatalog.remove(normalizedRiskRuleId);
    }
    return Object.freeze({ riskRuleId: normalizedRiskRuleId, deleted });
  }

  async findRiskRuleByName(name: string): Promise<FindRiskRuleByNameResult> {
    const normalizedName = name.trim();
    const riskRule = await this.riskRuleRepository.findByName(normalizedName);
    return Object.freeze({ riskRule });
  }

  async listRiskRulesByCategory(category: string): Promise<ListRiskRulesByCategoryResult> {
    const normalizedCategory = category.trim();
    const riskRules = Object.freeze(
      [...(await this.riskRuleRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      riskRules,
      total: riskRules.length,
      category: normalizedCategory,
    });
  }

  async getRiskRuleRegistryStatistics(): Promise<RiskRuleRegistryStatistics> {
    const riskRules = await this.riskRuleRepository.findAll();
    const activeRiskRules = riskRules.filter((riskRule) => riskRule.status === "active").length;
    const categories = Object.freeze([
      ...new Set(riskRules.map((riskRule) => riskRule.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalRiskRules: riskRules.length,
      activeRiskRules,
      categories,
    });
  }

  async serializeRiskRule(riskRule: RiskRule): Promise<string> {
    return this.riskRuleSerializer.serialize(riskRule);
  }

  async deserializeRiskRule(serialized: string): Promise<RiskRule> {
    return this.riskRuleSerializer.deserialize(serialized);
  }
}
