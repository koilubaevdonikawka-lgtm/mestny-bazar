/**
 * AI Capability Registry — unified registry for AI capabilities.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ICapabilityCatalog } from "@server/application/ai-capability-registry/contracts/capability-catalog.contract";
import type { ICapabilityRepository } from "@server/application/ai-capability-registry/contracts/capability-repository.contract";
import type { ICapabilitySerializer } from "@server/application/ai-capability-registry/contracts/capability-serializer.contract";
import type { ICapabilityStatisticsProvider } from "@server/application/ai-capability-registry/contracts/capability-statistics-provider.contract";
import type { ICapabilityValidator } from "@server/application/ai-capability-registry/contracts/capability-validator.contract";
import {
  createCapability,
  type Capability,
  type CapabilityRegistryStatistics,
  type DeleteCapabilityResult,
  type FindCapabilityByNameResult,
  type ListCapabilitiesByCategoryResult,
  type ListCapabilitiesResult,
  type RegisterCapabilityInput,
  type UpdateCapabilityInput,
} from "@server/application/ai-capability-registry/models/capability.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiCapabilityRegistryService {
  constructor(
    private readonly capabilityRepository: ICapabilityRepository,
    private readonly capabilityCatalog: ICapabilityCatalog,
    private readonly capabilityValidator: ICapabilityValidator,
    private readonly capabilitySerializer: ICapabilitySerializer,
    private readonly statisticsProvider: ICapabilityStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerCapability(input: RegisterCapabilityInput): Promise<Capability> {
    const validation = await this.capabilityValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.capabilityRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Capability already exists with name: ${input.name.trim()}`);
    }

    const capability = createCapability({
      capabilityId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      status: input.status,
    });

    await this.capabilityRepository.save(capability);
    await this.capabilityCatalog.register(capability);
    return capability;
  }

  async getCapability(capabilityId: string): Promise<Capability | null> {
    return this.capabilityRepository.findById(capabilityId.trim());
  }

  async listCapabilities(): Promise<ListCapabilitiesResult> {
    const capabilities = Object.freeze(
      [...(await this.capabilityRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ capabilities, total: capabilities.length });
  }

  async updateCapability(input: UpdateCapabilityInput): Promise<Capability> {
    const capabilityId = input.capabilityId.trim();
    const existing = await this.capabilityRepository.findById(capabilityId);
    if (!existing) {
      throw new Error(`Capability not found: ${capabilityId}`);
    }

    const validation = await this.capabilityValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.capabilityRepository.findByName(input.name.trim());
      if (duplicate && duplicate.capabilityId !== existing.capabilityId) {
        throw new Error(`Capability already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createCapability({
      capabilityId: existing.capabilityId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.capabilityRepository.save(updated);
    await this.capabilityCatalog.register(updated);
    return updated;
  }

  async deleteCapability(capabilityId: string): Promise<DeleteCapabilityResult> {
    const normalizedCapabilityId = capabilityId.trim();
    const deleted = await this.capabilityRepository.delete(normalizedCapabilityId);
    if (deleted) {
      await this.capabilityCatalog.remove(normalizedCapabilityId);
    }
    return Object.freeze({ capabilityId: normalizedCapabilityId, deleted });
  }

  async findCapabilityByName(name: string): Promise<FindCapabilityByNameResult> {
    const normalizedName = name.trim();
    const capability = await this.capabilityRepository.findByName(normalizedName);
    return Object.freeze({ capability });
  }

  async listCapabilitiesByCategory(category: string): Promise<ListCapabilitiesByCategoryResult> {
    const normalizedCategory = category.trim();
    const capabilities = Object.freeze(
      [...(await this.capabilityRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      capabilities,
      total: capabilities.length,
      category: normalizedCategory,
    });
  }

  async getCapabilityRegistryStatistics(): Promise<CapabilityRegistryStatistics> {
    const capabilities = await this.capabilityRepository.findAll();
    const activeCapabilities = capabilities.filter(
      (capability) => capability.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(capabilities.map((capability) => capability.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalCapabilities: capabilities.length,
      activeCapabilities,
      categories,
    });
  }

  async serializeCapability(capability: Capability): Promise<string> {
    return this.capabilitySerializer.serialize(capability);
  }

  async deserializeCapability(serialized: string): Promise<Capability> {
    return this.capabilitySerializer.deserialize(serialized);
  }
}
