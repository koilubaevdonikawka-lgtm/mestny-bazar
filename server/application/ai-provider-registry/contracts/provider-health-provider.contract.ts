import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

/** Future integration point for provider health checks. Not wired yet. */
export interface IProviderHealthProvider {
  checkHealth(provider: Provider): Promise<{ healthy: boolean }>;
}
