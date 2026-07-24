import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

/** Future integration point for provider capabilities. Not wired yet. */
export interface IProviderCapabilityProvider {
  listCapabilities(provider: Provider): Promise<readonly string[]>;
}
