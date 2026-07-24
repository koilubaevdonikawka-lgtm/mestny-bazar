import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

/** Future integration point for provider authentication. Not wired yet. */
export interface IProviderAuthenticationProvider {
  authenticate(provider: Provider): Promise<{ authenticated: boolean }>;
}
