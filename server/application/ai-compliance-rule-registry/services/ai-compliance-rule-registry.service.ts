/**
 * AI Compliance Rule Registry — unified registry for AI compliance rules.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IComplianceRuleCatalog } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-catalog.contract";
import type { IComplianceRuleRepository } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-repository.contract";
import type { IComplianceRuleSerializer } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-serializer.contract";
import type { IComplianceRuleStatisticsProvider } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-statistics-provider.contract";
import type { IComplianceRuleValidator } from "@server/application/ai-compliance-rule-registry/contracts/compliance-rule-validator.contract";
import {
  createComplianceRule,
  type DeleteComplianceRuleResult,
  type FindComplianceRuleByNameResult,
  type ComplianceRule,
  type ComplianceRuleRegistryStatistics,
  type ListComplianceRulesByCategoryResult,
  type ListComplianceRulesResult,
  type RegisterComplianceRuleInput,
  type UpdateComplianceRuleInput,
} from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiComplianceRuleRegistryService {
  constructor(
    private readonly complianceRuleRepository: IComplianceRuleRepository,
    private readonly complianceRuleCatalog: IComplianceRuleCatalog,
    private readonly complianceRuleValidator: IComplianceRuleValidator,
    private readonly complianceRuleSerializer: IComplianceRuleSerializer,
    private readonly statisticsProvider: IComplianceRuleStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerComplianceRule(input: RegisterComplianceRuleInput): Promise<ComplianceRule> {
    const validation = await this.complianceRuleValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.complianceRuleRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Compliance rule already exists with name: ${input.name.trim()}`);
    }

    const complianceRule = createComplianceRule({
      complianceRuleId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.complianceRuleRepository.save(complianceRule);
    await this.complianceRuleCatalog.register(complianceRule);
    return complianceRule;
  }

  async getComplianceRule(complianceRuleId: string): Promise<ComplianceRule | null> {
    return this.complianceRuleRepository.findById(complianceRuleId.trim());
  }

  async listComplianceRules(): Promise<ListComplianceRulesResult> {
    const complianceRules = Object.freeze(
      [...(await this.complianceRuleRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ complianceRules, total: complianceRules.length });
  }

  async updateComplianceRule(input: UpdateComplianceRuleInput): Promise<ComplianceRule> {
    const complianceRuleId = input.complianceRuleId.trim();
    const existing = await this.complianceRuleRepository.findById(complianceRuleId);
    if (!existing) {
      throw new Error(`Compliance rule not found: ${complianceRuleId}`);
    }

    const validation = await this.complianceRuleValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.complianceRuleRepository.findByName(input.name.trim());
      if (duplicate && duplicate.complianceRuleId !== existing.complianceRuleId) {
        throw new Error(`Compliance rule already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createComplianceRule({
      complianceRuleId: existing.complianceRuleId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.complianceRuleRepository.save(updated);
    await this.complianceRuleCatalog.register(updated);
    return updated;
  }

  async deleteComplianceRule(complianceRuleId: string): Promise<DeleteComplianceRuleResult> {
    const normalizedComplianceRuleId = complianceRuleId.trim();
    const deleted = await this.complianceRuleRepository.delete(normalizedComplianceRuleId);
    if (deleted) {
      await this.complianceRuleCatalog.remove(normalizedComplianceRuleId);
    }
    return Object.freeze({ complianceRuleId: normalizedComplianceRuleId, deleted });
  }

  async findComplianceRuleByName(name: string): Promise<FindComplianceRuleByNameResult> {
    const normalizedName = name.trim();
    const complianceRule = await this.complianceRuleRepository.findByName(normalizedName);
    return Object.freeze({ complianceRule });
  }

  async listComplianceRulesByCategory(category: string): Promise<ListComplianceRulesByCategoryResult> {
    const normalizedCategory = category.trim();
    const complianceRules = Object.freeze(
      [...(await this.complianceRuleRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      complianceRules,
      total: complianceRules.length,
      category: normalizedCategory,
    });
  }

  async getComplianceRuleRegistryStatistics(): Promise<ComplianceRuleRegistryStatistics> {
    const complianceRules = await this.complianceRuleRepository.findAll();
    const activeComplianceRules = complianceRules.filter(
      (complianceRule) => complianceRule.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(complianceRules.map((complianceRule) => complianceRule.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalComplianceRules: complianceRules.length,
      activeComplianceRules,
      categories,
    });
  }

  async serializeComplianceRule(complianceRule: ComplianceRule): Promise<string> {
    return this.complianceRuleSerializer.serialize(complianceRule);
  }

  async deserializeComplianceRule(serialized: string): Promise<ComplianceRule> {
    return this.complianceRuleSerializer.deserialize(serialized);
  }
}
