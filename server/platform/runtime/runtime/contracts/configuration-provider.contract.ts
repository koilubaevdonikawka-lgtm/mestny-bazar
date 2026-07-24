import type { ConfigurationSnapshot } from "@server/platform/runtime/runtime/models";

/** Unified runtime configuration contract. */
export interface IConfigurationProvider {
  get<T = unknown>(key: string): T | undefined;
  getRequired<T = unknown>(key: string): T;
  snapshot(): ConfigurationSnapshot;
  reload(): Promise<ConfigurationSnapshot>;
}
