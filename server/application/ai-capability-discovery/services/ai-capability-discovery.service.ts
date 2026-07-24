/**
 * AI Capability Discovery — discovery, registration, and description of AI capabilities.
 *
 * Fully independent module. No business logic or domain knowledge.
 * Does not execute tools or invoke AI.
 */
import type { ICapabilityCatalog } from "@server/application/ai-capability-discovery/contracts/capability-catalog.contract";
import type { ICapabilityRepository } from "@server/application/ai-capability-discovery/contracts/capability-repository.contract";
import type { ICapabilitySerializer } from "@server/application/ai-capability-discovery/contracts/capability-serializer.contract";
import type { ICapabilityStatisticsProvider } from "@server/application/ai-capability-discovery/contracts/capability-statistics-provider.contract";
import type { ICapabilityValidator } from "@server/application/ai-capability-discovery/contracts/capability-validator.contract";
import {
  createAiCapability,
  normalizeCapabilityCategory,
  type AiCapability,
  type CapabilityStatistics,
  type DeleteCapabilityResult,
  type FindCapabilityByNameResult,
  type ListCapabilitiesByCategoryResult,
  type ListCapabilitiesResult,
  type RegisterCapabilityInput,
  type UpdateCapabilityInput,
} from "@server/application/ai-capability-discovery/models/capability.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiCapabilityDiscoveryService {
  constructor(
    private readonly capabilityRepository: ICapabilityRepository,
    private readonly capabilityCatalog: ICapabilityCatalog,
    private readonly capabilityValidator: ICapabilityValidator,
    private readonly capabilitySerializer: ICapabilitySerializer,
    private readonly statisticsProvider: ICapabilityStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerCapability(input: RegisterCapabilityInput): Promise<AiCapability> {
    this.capabilityValidator.validateRegistration(input);

    const name = input.name.trim();
    if (await this.capabilityRepository.findByName(name)) {
      throw new Error(`Capability already exists: ${name}`);
    }

    const capability = createAiCapability({
      capabilityId: this.idGenerator.generate(),
      name,
      description: input.description,
      category: input.category,
      definition: input.definition,
      status: input.status,
    });

    await this.capabilityRepository.save(capability);
    return capability;
  }

  async getCapability(capabilityId: string): Promise<AiCapability | null> {
    return this.capabilityRepository.findById(capabilityId.trim());
  }

  async listCapabilities(): Promise<ListCapabilitiesResult> {
    const capabilities = Object.freeze([...(await this.capabilityCatalog.listAll())]);
    return Object.freeze({ capabilities, total: capabilities.length });
  }

  async updateCapability(input: UpdateCapabilityInput): Promise<AiCapability> {
    const capabilityId = input.capabilityId.trim();
    const existing = await this.capabilityRepository.findById(capabilityId);
    if (!existing) {
      throw new Error(`Capability not found: ${capabilityId}`);
    }

    this.capabilityValidator.validateUpdate(existing, input);

    const nextName = input.name?.trim() ?? existing.name;
    if (nextName !== existing.name && (await this.capabilityRepository.findByName(nextName))) {
      throw new Error(`Capability already exists: ${nextName}`);
    }

    const updated = createAiCapability({
      capabilityId: existing.capabilityId,
      name: nextName,
      description: input.description ?? existing.description,
      category: input.category ?? existing.category,
      definition: input.definition ?? existing.definition,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.capabilityRepository.save(updated);
    return updated;
  }

  async deleteCapability(capabilityId: string): Promise<DeleteCapabilityResult> {
    const normalizedCapabilityId = capabilityId.trim();
    const deleted = await this.capabilityRepository.delete(normalizedCapabilityId);
    return Object.freeze({ capabilityId: normalizedCapabilityId, deleted });
  }

  async findCapabilityByName(name: string): Promise<FindCapabilityByNameResult> {
    const normalizedName = name.trim();
    const capability = await this.capabilityCatalog.findByName(normalizedName);
    return Object.freeze({ name: normalizedName, capability });
  }

  async listCapabilitiesByCategory(
    category: string,
  ): Promise<ListCapabilitiesByCategoryResult> {
    const normalizedCategory = normalizeCapabilityCategory(category);
    const capabilities = Object.freeze([
      ...(await this.capabilityCatalog.listByCategory(normalizedCategory)),
    ]);
    return Object.freeze({
      category: normalizedCategory,
      capabilities,
      total: capabilities.length,
    });
  }

  async getCapabilityStatistics(): Promise<CapabilityStatistics> {
    const capabilities = await this.capabilityRepository.findAll();
    const categories = new Set(capabilities.map((capability) => capability.category));
    const activeCapabilities = capabilities.filter(
      (capability) => capability.status === "active",
    ).length;
    const inactiveCapabilities = capabilities.filter(
      (capability) => capability.status === "inactive",
    ).length;

    return this.statisticsProvider.getStatistics({
      totalCapabilities: capabilities.length,
      totalCategories: categories.size,
      activeCapabilities,
      inactiveCapabilities,
    });
  }

  serializeCapabilityDescription(capability: AiCapability): string {
    return this.capabilitySerializer.serialize(capability);
  }
}
