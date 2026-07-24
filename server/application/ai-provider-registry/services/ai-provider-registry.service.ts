/**
 * AI Provider Registry — unified registry for AI providers.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IProviderCatalog } from "@server/application/ai-provider-registry/contracts/provider-catalog.contract";
import type { IProviderRepository } from "@server/application/ai-provider-registry/contracts/provider-repository.contract";
import type { IProviderSerializer } from "@server/application/ai-provider-registry/contracts/provider-serializer.contract";
import type { IProviderStatisticsProvider } from "@server/application/ai-provider-registry/contracts/provider-statistics-provider.contract";
import type { IProviderValidator } from "@server/application/ai-provider-registry/contracts/provider-validator.contract";
import {
  createProvider,
  type DeleteProviderResult,
  type FindProviderByNameResult,
  type ListProvidersByTypeResult,
  type ListProvidersResult,
  type Provider,
  type ProviderRegistryStatistics,
  type RegisterProviderInput,
  type UpdateProviderInput,
} from "@server/application/ai-provider-registry/models/provider.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiProviderRegistryService {
  constructor(
    private readonly providerRepository: IProviderRepository,
    private readonly providerCatalog: IProviderCatalog,
    private readonly providerValidator: IProviderValidator,
    private readonly providerSerializer: IProviderSerializer,
    private readonly statisticsProvider: IProviderStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerProvider(input: RegisterProviderInput): Promise<Provider> {
    const validation = await this.providerValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.providerRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Provider already exists with name: ${input.name.trim()}`);
    }

    const provider = createProvider({
      providerId: this.idGenerator.generate(),
      name: input.name,
      type: input.type,
      description: input.description,
      configuration: input.configuration,
      status: input.status,
    });

    await this.providerRepository.save(provider);
    await this.providerCatalog.register(provider);
    return provider;
  }

  async getProvider(providerId: string): Promise<Provider | null> {
    return this.providerRepository.findById(providerId.trim());
  }

  async listProviders(): Promise<ListProvidersResult> {
    const providers = Object.freeze(
      [...(await this.providerRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ providers, total: providers.length });
  }

  async updateProvider(input: UpdateProviderInput): Promise<Provider> {
    const providerId = input.providerId.trim();
    const existing = await this.providerRepository.findById(providerId);
    if (!existing) {
      throw new Error(`Provider not found: ${providerId}`);
    }

    const validation = await this.providerValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.providerRepository.findByName(input.name.trim());
      if (duplicate && duplicate.providerId !== existing.providerId) {
        throw new Error(`Provider already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createProvider({
      providerId: existing.providerId,
      name: input.name?.trim() ?? existing.name,
      type: input.type?.trim() ?? existing.type,
      description: input.description ?? existing.description,
      configuration: input.configuration?.trim() ?? existing.configuration,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.providerRepository.save(updated);
    await this.providerCatalog.register(updated);
    return updated;
  }

  async deleteProvider(providerId: string): Promise<DeleteProviderResult> {
    const normalizedProviderId = providerId.trim();
    const deleted = await this.providerRepository.delete(normalizedProviderId);
    if (deleted) {
      await this.providerCatalog.remove(normalizedProviderId);
    }
    return Object.freeze({ providerId: normalizedProviderId, deleted });
  }

  async findProviderByName(name: string): Promise<FindProviderByNameResult> {
    const normalizedName = name.trim();
    const provider = await this.providerRepository.findByName(normalizedName);
    return Object.freeze({ provider });
  }

  async listProvidersByType(type: string): Promise<ListProvidersByTypeResult> {
    const normalizedType = type.trim();
    const providers = Object.freeze(
      [...(await this.providerRepository.findByType(normalizedType))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      providers,
      total: providers.length,
      type: normalizedType,
    });
  }

  async getProviderRegistryStatistics(): Promise<ProviderRegistryStatistics> {
    const providers = await this.providerRepository.findAll();
    const activeProviders = providers.filter((provider) => provider.status === "active").length;
    const types = Object.freeze([
      ...new Set(providers.map((provider) => provider.type)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalProviders: providers.length,
      activeProviders,
      types,
    });
  }

  async serializeProvider(provider: Provider): Promise<string> {
    return this.providerSerializer.serialize(provider);
  }

  async deserializeProvider(serialized: string): Promise<Provider> {
    return this.providerSerializer.deserialize(serialized);
  }
}
