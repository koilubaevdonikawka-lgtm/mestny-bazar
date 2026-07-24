/**
 * AI Policy Set Registry — unified registry for AI policy sets.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IPolicySetCatalog } from "@server/application/ai-policy-set-registry/contracts/policy-set-catalog.contract";
import type { IPolicySetRepository } from "@server/application/ai-policy-set-registry/contracts/policy-set-repository.contract";
import type { IPolicySetSerializer } from "@server/application/ai-policy-set-registry/contracts/policy-set-serializer.contract";
import type { IPolicySetStatisticsProvider } from "@server/application/ai-policy-set-registry/contracts/policy-set-statistics-provider.contract";
import type { IPolicySetValidator } from "@server/application/ai-policy-set-registry/contracts/policy-set-validator.contract";
import {
  createPolicySet,
  type DeletePolicySetResult,
  type FindPolicySetByNameResult,
  type ListPolicySetsByCategoryResult,
  type ListPolicySetsResult,
  type RegisterPolicySetInput,
  type PolicySet,
  type PolicySetRegistryStatistics,
  type UpdatePolicySetInput,
} from "@server/application/ai-policy-set-registry/models/policy-set.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiPolicySetRegistryService {
  constructor(
    private readonly policySetRepository: IPolicySetRepository,
    private readonly policySetCatalog: IPolicySetCatalog,
    private readonly policySetValidator: IPolicySetValidator,
    private readonly policySetSerializer: IPolicySetSerializer,
    private readonly statisticsProvider: IPolicySetStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerPolicySet(input: RegisterPolicySetInput): Promise<PolicySet> {
    const validation = await this.policySetValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.policySetRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Policy set already exists with name: ${input.name.trim()}`);
    }

    const policySet = createPolicySet({
      policySetId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.policySetRepository.save(policySet);
    await this.policySetCatalog.register(policySet);
    return policySet;
  }

  async getPolicySet(policySetId: string): Promise<PolicySet | null> {
    return this.policySetRepository.findById(policySetId.trim());
  }

  async listPolicySets(): Promise<ListPolicySetsResult> {
    const policySets = Object.freeze(
      [...(await this.policySetRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ policySets, total: policySets.length });
  }

  async updatePolicySet(input: UpdatePolicySetInput): Promise<PolicySet> {
    const policySetId = input.policySetId.trim();
    const existing = await this.policySetRepository.findById(policySetId);
    if (!existing) {
      throw new Error(`Policy set not found: ${policySetId}`);
    }

    const validation = await this.policySetValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.policySetRepository.findByName(input.name.trim());
      if (duplicate && duplicate.policySetId !== existing.policySetId) {
        throw new Error(`Policy set already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createPolicySet({
      policySetId: existing.policySetId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.policySetRepository.save(updated);
    await this.policySetCatalog.register(updated);
    return updated;
  }

  async deletePolicySet(policySetId: string): Promise<DeletePolicySetResult> {
    const normalizedPolicySetId = policySetId.trim();
    const deleted = await this.policySetRepository.delete(normalizedPolicySetId);
    if (deleted) {
      await this.policySetCatalog.remove(normalizedPolicySetId);
    }
    return Object.freeze({ policySetId: normalizedPolicySetId, deleted });
  }

  async findPolicySetByName(name: string): Promise<FindPolicySetByNameResult> {
    const normalizedName = name.trim();
    const policySet = await this.policySetRepository.findByName(normalizedName);
    return Object.freeze({ policySet });
  }

  async listPolicySetsByCategory(category: string): Promise<ListPolicySetsByCategoryResult> {
    const normalizedCategory = category.trim();
    const policySets = Object.freeze(
      [...(await this.policySetRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      policySets,
      total: policySets.length,
      category: normalizedCategory,
    });
  }

  async getPolicySetRegistryStatistics(): Promise<PolicySetRegistryStatistics> {
    const policySets = await this.policySetRepository.findAll();
    const activePolicySets = policySets.filter((policySet) => policySet.status === "active").length;
    const categories = Object.freeze([
      ...new Set(policySets.map((policySet) => policySet.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalPolicySets: policySets.length,
      activePolicySets,
      categories,
    });
  }

  async serializePolicySet(policySet: PolicySet): Promise<string> {
    return this.policySetSerializer.serialize(policySet);
  }

  async deserializePolicySet(serialized: string): Promise<PolicySet> {
    return this.policySetSerializer.deserialize(serialized);
  }
}
