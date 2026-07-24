import type { ConfigurationEntry } from "@server/application/configuration-management/models/configuration.model";

export interface IConfigurationRepository {
  save(entry: ConfigurationEntry): Promise<void>;
  findByKey(key: string): Promise<ConfigurationEntry | null>;
  delete(key: string): Promise<void>;
  findAll(): Promise<readonly ConfigurationEntry[]>;
  exists(key: string): Promise<boolean>;
}
