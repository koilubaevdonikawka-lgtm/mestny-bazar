import type { IConfigurationProvider } from "@server/platform/runtime/runtime/contracts";
import {
  createConfigurationSnapshot,
  type ConfigurationSnapshot,
} from "@server/platform/runtime/runtime/models";
import { createConfigurationReloadedEvent } from "@server/platform/runtime/runtime/events";
import type { ConfigurationProvider as InfrastructureConfigurationProvider } from "@server/infrastructure/configuration";
import type { ISecretProvider } from "@server/platform/runtime/runtime/contracts";

/** Unified runtime configuration service with future secret backend support. */
export class ConfigurationService implements IConfigurationProvider {
  private snapshotCache: ConfigurationSnapshot;

  constructor(
    private readonly infrastructureConfiguration: InfrastructureConfigurationProvider,
    private readonly secretProvider: ISecretProvider,
  ) {
    this.snapshotCache = this.buildSnapshot();
  }

  get<T = unknown>(key: string): T | undefined {
    const envValue = this.secretProvider.getSecret(key);
    if (envValue !== undefined) {
      return envValue as T;
    }

    const marketplaceKey = key as keyof ReturnType<
      InfrastructureConfigurationProvider["snapshot"]
    >;
    const snapshot = this.infrastructureConfiguration.snapshot();
    if (marketplaceKey in snapshot) {
      return snapshot[marketplaceKey] as T;
    }

    return this.snapshotCache.values[key] as T | undefined;
  }

  getRequired<T = unknown>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined) {
      throw new Error(`Required configuration key "${key}" is not available.`);
    }
    return value;
  }

  snapshot(): ConfigurationSnapshot {
    return this.snapshotCache;
  }

  async reload(): Promise<ConfigurationSnapshot> {
    this.snapshotCache = this.buildSnapshot();
    createConfigurationReloadedEvent(this.snapshotCache.source);
    return this.snapshotCache;
  }

  private buildSnapshot(): ConfigurationSnapshot {
    const marketplace = this.infrastructureConfiguration.snapshot();
    return createConfigurationSnapshot({
      source: "composition-root",
      values: Object.freeze({
        appName: marketplace.appName,
        defaultLocale: marketplace.defaultLocale,
        defaultCurrency: marketplace.defaultCurrency,
        persistence: marketplace.persistence,
        paymentProvider: marketplace.paymentProvider,
        notificationProvider: marketplace.notificationProvider,
        storageProvider: marketplace.storageProvider,
        eventBusEnabled: marketplace.eventBusEnabled,
      }),
    });
  }
}
