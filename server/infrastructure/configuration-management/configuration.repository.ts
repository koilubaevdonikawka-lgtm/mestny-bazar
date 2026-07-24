import type { IConfigurationRepository } from "@server/application/configuration-management/contracts/configuration-repository.contract";
import type { ConfigurationEntry } from "@server/application/configuration-management/models/configuration.model";

/** In-memory configuration store. */
export class ConfigurationRepository implements IConfigurationRepository {
  private readonly entries = new Map<string, ConfigurationEntry>();

  constructor() {
    this.seedDefaults();
  }

  async save(entry: ConfigurationEntry): Promise<void> {
    this.entries.set(entry.key, entry);
  }

  async findByKey(key: string): Promise<ConfigurationEntry | null> {
    return this.entries.get(key.trim()) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key.trim());
  }

  async findAll(): Promise<readonly ConfigurationEntry[]> {
    return Object.freeze(
      [...this.entries.values()].sort((left, right) => left.key.localeCompare(right.key)),
    );
  }

  async exists(key: string): Promise<boolean> {
    return this.entries.has(key.trim());
  }

  private seedDefaults(): void {
    const now = new Date().toISOString();
    const defaults: ConfigurationEntry[] = [
      Object.freeze({
        key: "app.name",
        value: JSON.stringify("Everyday Eats Hub"),
        description: "Application display name",
        encrypted: false,
        createdAt: now,
        updatedAt: now,
      }),
      Object.freeze({
        key: "app.environment",
        value: JSON.stringify("development"),
        description: "Runtime environment",
        encrypted: false,
        createdAt: now,
        updatedAt: now,
      }),
      Object.freeze({
        key: "features.maintenanceMode",
        value: JSON.stringify(false),
        description: "Global maintenance mode flag",
        encrypted: false,
        createdAt: now,
        updatedAt: now,
      }),
    ];

    for (const entry of defaults) {
      this.entries.set(entry.key, entry);
    }
  }
}
