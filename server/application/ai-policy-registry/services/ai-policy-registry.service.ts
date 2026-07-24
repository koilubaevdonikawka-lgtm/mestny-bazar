/**
 * AI Policy Registry — unified registry for AI policies.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IPolicyCatalog } from "@server/application/ai-policy-registry/contracts/policy-catalog.contract";
import type { IPolicyRepository } from "@server/application/ai-policy-registry/contracts/policy-repository.contract";
import type { IPolicySerializer } from "@server/application/ai-policy-registry/contracts/policy-serializer.contract";
import type { IPolicyStatisticsProvider } from "@server/application/ai-policy-registry/contracts/policy-statistics-provider.contract";
import type { IPolicyValidator } from "@server/application/ai-policy-registry/contracts/policy-validator.contract";
import {
  createPolicy,
  type DeletePolicyResult,
  type FindPolicyByNameResult,
  type ListPoliciesByCategoryResult,
  type ListPoliciesResult,
  type Policy,
  type PolicyRegistryStatistics,
  type RegisterPolicyInput,
  type UpdatePolicyInput,
} from "@server/application/ai-policy-registry/models/policy.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiPolicyRegistryService {
  constructor(
    private readonly policyRepository: IPolicyRepository,
    private readonly policyCatalog: IPolicyCatalog,
    private readonly policyValidator: IPolicyValidator,
    private readonly policySerializer: IPolicySerializer,
    private readonly statisticsProvider: IPolicyStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerPolicy(input: RegisterPolicyInput): Promise<Policy> {
    const validation = await this.policyValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.policyRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Policy already exists with name: ${input.name.trim()}`);
    }

    const policy = createPolicy({
      policyId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.policyRepository.save(policy);
    await this.policyCatalog.register(policy);
    return policy;
  }

  async getPolicy(policyId: string): Promise<Policy | null> {
    return this.policyRepository.findById(policyId.trim());
  }

  async listPolicies(): Promise<ListPoliciesResult> {
    const policies = Object.freeze(
      [...(await this.policyRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ policies, total: policies.length });
  }

  async updatePolicy(input: UpdatePolicyInput): Promise<Policy> {
    const policyId = input.policyId.trim();
    const existing = await this.policyRepository.findById(policyId);
    if (!existing) {
      throw new Error(`Policy not found: ${policyId}`);
    }

    const validation = await this.policyValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.policyRepository.findByName(input.name.trim());
      if (duplicate && duplicate.policyId !== existing.policyId) {
        throw new Error(`Policy already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createPolicy({
      policyId: existing.policyId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.policyRepository.save(updated);
    await this.policyCatalog.register(updated);
    return updated;
  }

  async deletePolicy(policyId: string): Promise<DeletePolicyResult> {
    const normalizedPolicyId = policyId.trim();
    const deleted = await this.policyRepository.delete(normalizedPolicyId);
    if (deleted) {
      await this.policyCatalog.remove(normalizedPolicyId);
    }
    return Object.freeze({ policyId: normalizedPolicyId, deleted });
  }

  async findPolicyByName(name: string): Promise<FindPolicyByNameResult> {
    const normalizedName = name.trim();
    const policy = await this.policyRepository.findByName(normalizedName);
    return Object.freeze({ policy });
  }

  async listPoliciesByCategory(category: string): Promise<ListPoliciesByCategoryResult> {
    const normalizedCategory = category.trim();
    const policies = Object.freeze(
      [...(await this.policyRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      policies,
      total: policies.length,
      category: normalizedCategory,
    });
  }

  async getPolicyRegistryStatistics(): Promise<PolicyRegistryStatistics> {
    const policies = await this.policyRepository.findAll();
    const activePolicies = policies.filter((policy) => policy.status === "active").length;
    const categories = Object.freeze([
      ...new Set(policies.map((policy) => policy.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalPolicies: policies.length,
      activePolicies,
      categories,
    });
  }

  async serializePolicy(policy: Policy): Promise<string> {
    return this.policySerializer.serialize(policy);
  }

  async deserializePolicy(serialized: string): Promise<Policy> {
    return this.policySerializer.deserialize(serialized);
  }
}
