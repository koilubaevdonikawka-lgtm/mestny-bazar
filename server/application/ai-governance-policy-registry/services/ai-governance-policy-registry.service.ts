/**
 * AI Governance Policy Registry — unified registry for AI governance policies.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IGovernancePolicyCatalog } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-catalog.contract";
import type { IGovernancePolicyRepository } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-repository.contract";
import type { IGovernancePolicySerializer } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-serializer.contract";
import type { IGovernancePolicyStatisticsProvider } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-statistics-provider.contract";
import type { IGovernancePolicyValidator } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-validator.contract";
import {
  createGovernancePolicy,
  type DeleteGovernancePolicyResult,
  type FindGovernancePolicyByNameResult,
  type GovernancePolicy,
  type GovernancePolicyRegistryStatistics,
  type ListGovernancePoliciesByCategoryResult,
  type ListGovernancePoliciesResult,
  type RegisterGovernancePolicyInput,
  type UpdateGovernancePolicyInput,
} from "@server/application/ai-governance-policy-registry/models/governance-policy.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiGovernancePolicyRegistryService {
  constructor(
    private readonly governancePolicyRepository: IGovernancePolicyRepository,
    private readonly governancePolicyCatalog: IGovernancePolicyCatalog,
    private readonly governancePolicyValidator: IGovernancePolicyValidator,
    private readonly governancePolicySerializer: IGovernancePolicySerializer,
    private readonly statisticsProvider: IGovernancePolicyStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerGovernancePolicy(input: RegisterGovernancePolicyInput): Promise<GovernancePolicy> {
    const validation = await this.governancePolicyValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.governancePolicyRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Governance policy already exists with name: ${input.name.trim()}`);
    }

    const governancePolicy = createGovernancePolicy({
      governancePolicyId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.governancePolicyRepository.save(governancePolicy);
    await this.governancePolicyCatalog.register(governancePolicy);
    return governancePolicy;
  }

  async getGovernancePolicy(governancePolicyId: string): Promise<GovernancePolicy | null> {
    return this.governancePolicyRepository.findById(governancePolicyId.trim());
  }

  async listGovernancePolicies(): Promise<ListGovernancePoliciesResult> {
    const governancePolicies = Object.freeze(
      [...(await this.governancePolicyRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ governancePolicies, total: governancePolicies.length });
  }

  async updateGovernancePolicy(input: UpdateGovernancePolicyInput): Promise<GovernancePolicy> {
    const governancePolicyId = input.governancePolicyId.trim();
    const existing = await this.governancePolicyRepository.findById(governancePolicyId);
    if (!existing) {
      throw new Error(`Governance policy not found: ${governancePolicyId}`);
    }

    const validation = await this.governancePolicyValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.governancePolicyRepository.findByName(input.name.trim());
      if (duplicate && duplicate.governancePolicyId !== existing.governancePolicyId) {
        throw new Error(`Governance policy already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createGovernancePolicy({
      governancePolicyId: existing.governancePolicyId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.governancePolicyRepository.save(updated);
    await this.governancePolicyCatalog.register(updated);
    return updated;
  }

  async deleteGovernancePolicy(governancePolicyId: string): Promise<DeleteGovernancePolicyResult> {
    const normalizedGovernancePolicyId = governancePolicyId.trim();
    const deleted = await this.governancePolicyRepository.delete(normalizedGovernancePolicyId);
    if (deleted) {
      await this.governancePolicyCatalog.remove(normalizedGovernancePolicyId);
    }
    return Object.freeze({ governancePolicyId: normalizedGovernancePolicyId, deleted });
  }

  async findGovernancePolicyByName(name: string): Promise<FindGovernancePolicyByNameResult> {
    const normalizedName = name.trim();
    const governancePolicy = await this.governancePolicyRepository.findByName(normalizedName);
    return Object.freeze({ governancePolicy });
  }

  async listGovernancePoliciesByCategory(category: string): Promise<ListGovernancePoliciesByCategoryResult> {
    const normalizedCategory = category.trim();
    const governancePolicies = Object.freeze(
      [...(await this.governancePolicyRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      governancePolicies,
      total: governancePolicies.length,
      category: normalizedCategory,
    });
  }

  async getGovernancePolicyRegistryStatistics(): Promise<GovernancePolicyRegistryStatistics> {
    const governancePolicies = await this.governancePolicyRepository.findAll();
    const activeGovernancePolicies = governancePolicies.filter(
      (governancePolicy) => governancePolicy.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(governancePolicies.map((governancePolicy) => governancePolicy.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalGovernancePolicies: governancePolicies.length,
      activeGovernancePolicies,
      categories,
    });
  }

  async serializeGovernancePolicy(governancePolicy: GovernancePolicy): Promise<string> {
    return this.governancePolicySerializer.serialize(governancePolicy);
  }

  async deserializeGovernancePolicy(serialized: string): Promise<GovernancePolicy> {
    return this.governancePolicySerializer.deserialize(serialized);
  }
}
