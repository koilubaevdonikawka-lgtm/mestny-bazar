import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

export interface IProviderRepository {
  save(provider: Provider): Promise<void>;
  findById(providerId: string): Promise<Provider | null>;
  findByName(name: string): Promise<Provider | null>;
  findByType(type: string): Promise<readonly Provider[]>;
  findAll(): Promise<readonly Provider[]>;
  delete(providerId: string): Promise<boolean>;
}
