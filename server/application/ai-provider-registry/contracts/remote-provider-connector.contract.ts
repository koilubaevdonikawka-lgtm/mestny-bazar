import type { Provider } from "@server/application/ai-provider-registry/models/provider.model";

/** Future integration point for remote provider connectors. Not wired yet. */
export interface IRemoteProviderConnector {
  connect(provider: Provider): Promise<{ connectionId: string }>;
  disconnect(connectionId: string): Promise<boolean>;
}
