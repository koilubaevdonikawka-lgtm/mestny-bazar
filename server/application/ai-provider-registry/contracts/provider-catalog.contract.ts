import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

export interface IProviderCatalog {
  register(provider: Provider): Promise<void>;
  remove(providerId: string): Promise<void>;
  findById(providerId: string): Promise<Provider | null>;
  findByName(name: string): Promise<Provider | null>;
  findByType(type: string): Promise<readonly Provider[]>;
  listAll(): Promise<readonly Provider[]>;
}
