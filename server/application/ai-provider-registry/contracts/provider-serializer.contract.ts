import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

export interface IProviderSerializer {
  serialize(provider: Provider): Promise<string>;
  deserialize(serialized: string): Promise<Provider>;
}
