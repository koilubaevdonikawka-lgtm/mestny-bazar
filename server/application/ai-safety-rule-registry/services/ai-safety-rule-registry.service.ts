/**
 * AI Safety Rule Registry — unified registry for AI safety rules.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISafetyRuleCatalog } from "@server/application/ai-safety-rule-registry/contracts/safety-rule-catalog.contract";
import type { ISafetyRuleRepository } from "@server/application/ai-safety-rule-registry/contracts/safety-rule-repository.contract";
import type { ISafetyRuleSerializer } from "@server/application/ai-safety-rule-registry/contracts/safety-rule-serializer.contract";
import type { ISafetyRuleStatisticsProvider } from "@server/application/ai-safety-rule-registry/contracts/safety-rule-statistics-provider.contract";
import type { ISafetyRuleValidator } from "@server/application/ai-safety-rule-registry/contracts/safety-rule-validator.contract";
import {
  createSafetyRule,
  type DeleteSafetyRuleResult,
  type FindSafetyRuleByNameResult,
  type ListSafetyRulesByCategoryResult,
  type ListSafetyRulesResult,
  type RegisterSafetyRuleInput,
  type SafetyRule,
  type SafetyRuleRegistryStatistics,
  type UpdateSafetyRuleInput,
} from "@server/application/ai-safety-rule-registry/models/safety-rule.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiSafetyRuleRegistryService {
  constructor(
    private readonly safetyRuleRepository: ISafetyRuleRepository,
    private readonly safetyRuleCatalog: ISafetyRuleCatalog,
    private readonly safetyRuleValidator: ISafetyRuleValidator,
    private readonly safetyRuleSerializer: ISafetyRuleSerializer,
    private readonly statisticsProvider: ISafetyRuleStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSafetyRule(input: RegisterSafetyRuleInput): Promise<SafetyRule> {
    const validation = await this.safetyRuleValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.safetyRuleRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Safety rule already exists with name: ${input.name.trim()}`);
    }

    const safetyRule = createSafetyRule({
      safetyRuleId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.safetyRuleRepository.save(safetyRule);
    await this.safetyRuleCatalog.register(safetyRule);
    return safetyRule;
  }

  async getSafetyRule(safetyRuleId: string): Promise<SafetyRule | null> {
    return this.safetyRuleRepository.findById(safetyRuleId.trim());
  }

  async listSafetyRules(): Promise<ListSafetyRulesResult> {
    const safetyRules = Object.freeze(
      [...(await this.safetyRuleRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ safetyRules, total: safetyRules.length });
  }

  async updateSafetyRule(input: UpdateSafetyRuleInput): Promise<SafetyRule> {
    const safetyRuleId = input.safetyRuleId.trim();
    const existing = await this.safetyRuleRepository.findById(safetyRuleId);
    if (!existing) {
      throw new Error(`Safety rule not found: ${safetyRuleId}`);
    }

    const validation = await this.safetyRuleValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.safetyRuleRepository.findByName(input.name.trim());
      if (duplicate && duplicate.safetyRuleId !== existing.safetyRuleId) {
        throw new Error(`Safety rule already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createSafetyRule({
      safetyRuleId: existing.safetyRuleId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.safetyRuleRepository.save(updated);
    await this.safetyRuleCatalog.register(updated);
    return updated;
  }

  async deleteSafetyRule(safetyRuleId: string): Promise<DeleteSafetyRuleResult> {
    const normalizedSafetyRuleId = safetyRuleId.trim();
    const deleted = await this.safetyRuleRepository.delete(normalizedSafetyRuleId);
    if (deleted) {
      await this.safetyRuleCatalog.remove(normalizedSafetyRuleId);
    }
    return Object.freeze({ safetyRuleId: normalizedSafetyRuleId, deleted });
  }

  async findSafetyRuleByName(name: string): Promise<FindSafetyRuleByNameResult> {
    const normalizedName = name.trim();
    const safetyRule = await this.safetyRuleRepository.findByName(normalizedName);
    return Object.freeze({ safetyRule });
  }

  async listSafetyRulesByCategory(category: string): Promise<ListSafetyRulesByCategoryResult> {
    const normalizedCategory = category.trim();
    const safetyRules = Object.freeze(
      [...(await this.safetyRuleRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      safetyRules,
      total: safetyRules.length,
      category: normalizedCategory,
    });
  }

  async getSafetyRuleRegistryStatistics(): Promise<SafetyRuleRegistryStatistics> {
    const safetyRules = await this.safetyRuleRepository.findAll();
    const activeSafetyRules = safetyRules.filter(
      (safetyRule) => safetyRule.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(safetyRules.map((safetyRule) => safetyRule.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalSafetyRules: safetyRules.length,
      activeSafetyRules,
      categories,
    });
  }

  async serializeSafetyRule(safetyRule: SafetyRule): Promise<string> {
    return this.safetyRuleSerializer.serialize(safetyRule);
  }

  async deserializeSafetyRule(serialized: string): Promise<SafetyRule> {
    return this.safetyRuleSerializer.deserialize(serialized);
  }
}
