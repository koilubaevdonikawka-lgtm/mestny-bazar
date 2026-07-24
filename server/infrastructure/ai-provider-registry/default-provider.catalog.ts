import type { IProviderCatalog } from "@server/application/ai-provider-registry/contracts/provider-catalog.contract";
import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

/** Default in-memory provider catalog index. */
export class DefaultProviderCatalog implements IProviderCatalog {
  private readonly providers = new Map<string, Provider>();
  private readonly providersByName = new Map<string, string>();
  private readonly providersByType = new Map<string, Set<string>>();

  async register(provider: Provider): Promise<void> {
    const existing = this.providers.get(provider.providerId);
    if (existing) {
      if (existing.name !== provider.name) {
        this.providersByName.delete(existing.name);
      }
      if (existing.type !== provider.type) {
        this.removeFromType(existing.type, existing.providerId);
      }
    }

    this.providers.set(provider.providerId, provider);
    this.providersByName.set(provider.name, provider.providerId);
    this.addToType(provider.type, provider.providerId);
  }

  async remove(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId.trim());
    if (!provider) {
      return;
    }
    this.providers.delete(provider.providerId);
    this.providersByName.delete(provider.name);
    this.removeFromType(provider.type, provider.providerId);
  }

  async findById(providerId: string): Promise<Provider | null> {
    return this.providers.get(providerId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Provider | null> {
    const providerId = this.providersByName.get(name.trim());
    if (!providerId) {
      return null;
    }
    return this.providers.get(providerId) ?? null;
  }

  async findByType(type: string): Promise<readonly Provider[]> {
    const providerIds = this.providersByType.get(type.trim());
    if (!providerIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...providerIds]
        .map((providerId) => this.providers.get(providerId))
        .filter((provider): provider is Provider => provider !== undefined),
    );
  }

  async listAll(): Promise<readonly Provider[]> {
    return Object.freeze([...this.providers.values()]);
  }

  private addToType(type: string, providerId: string): void {
    const normalizedType = type.trim();
    const typeSet = this.providersByType.get(normalizedType) ?? new Set<string>();
    typeSet.add(providerId);
    this.providersByType.set(normalizedType, typeSet);
  }

  private removeFromType(type: string, providerId: string): void {
    const normalizedType = type.trim();
    const typeSet = this.providersByType.get(normalizedType);
    if (!typeSet) {
      return;
    }
    typeSet.delete(providerId);
    if (typeSet.size === 0) {
      this.providersByType.delete(normalizedType);
    }
  }
}
