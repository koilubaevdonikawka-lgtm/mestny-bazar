/**
 * Future integration ports for Configuration Management.
 * Not implemented — reserved for external configuration systems.
 */

import type { ConfigurationEntry } from "@server/application/configuration-management/models/configuration.model";

/** Secrets Provider — secure secrets retrieval. */
export interface ISecretsProvider {
  getSecret(secretKey: string): Promise<string | null>;
  setSecret(secretKey: string, value: string): Promise<void>;
  deleteSecret(secretKey: string): Promise<void>;
}

/** Remote Configuration Provider — pull config from remote source. */
export interface IRemoteConfigurationProvider {
  fetchRemote(key: string): Promise<unknown | null>;
  syncRemote(): Promise<readonly ConfigurationEntry[]>;
}

/** Feature Flag Provider — feature toggle management. */
export interface IFeatureFlagProvider {
  isEnabled(flagKey: string): Promise<boolean>;
  setFlag(flagKey: string, enabled: boolean): Promise<void>;
  listFlags(): Promise<Readonly<Record<string, boolean>>>;
}

/** Configuration Cache — cached configuration lookups. */
export interface IConfigurationCache {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** Configuration Versioning — version history for config changes. */
export interface IConfigurationVersioning {
  recordVersion(entry: ConfigurationEntry, changedBy?: string): Promise<string>;
  getVersionHistory(key: string): Promise<readonly ConfigurationEntry[]>;
  restoreVersion(key: string, versionId: string): Promise<ConfigurationEntry>;
}
