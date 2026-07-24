import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

/** Future integration point for provider synchronization. Not wired yet. */
export interface IProviderSynchronizationProvider {
  synchronize(provider: Provider): Promise<{ synchronized: boolean }>;
  fetchRemote(providerId: string): Promise<Provider | null>;
}
