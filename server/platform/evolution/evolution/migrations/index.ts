import { createMigrationDescriptor } from "@server/platform/evolution/evolution/models";
import type { IMigrationRegistry } from "@server/platform/evolution/evolution/contracts";

/** Default platform migration catalog for evolution bootstrap. */
export const DEFAULT_MIGRATIONS = Object.freeze([
  createMigrationDescriptor({
    id: "migration-platform-runtime",
    name: "Platform Runtime Migration",
    kind: "platform",
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Migrate runtime platform metadata to 1.1.0.",
  }),
  createMigrationDescriptor({
    id: "migration-provider-registry",
    name: "Provider Registry Migration",
    kind: "provider",
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Align provider registry descriptors.",
  }),
  createMigrationDescriptor({
    id: "migration-configuration",
    name: "Configuration Migration",
    kind: "configuration",
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Migrate configuration snapshot schema.",
  }),
  createMigrationDescriptor({
    id: "migration-contracts",
    name: "Contract Migration",
    kind: "contract",
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Update platform contract metadata.",
  }),
  createMigrationDescriptor({
    id: "migration-documentation",
    name: "Documentation Migration",
    kind: "documentation",
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Refresh architecture documentation snapshot.",
  }),
]);

/** Registers default migrations in the registry. */
export function registerDefaultMigrations(registry: IMigrationRegistry): void {
  for (const migration of DEFAULT_MIGRATIONS) {
    try {
      registry.register(migration);
    } catch {
      // Migration may already be registered during repeated bootstrap.
    }
  }
}

export { EvolutionManager } from "./evolution-manager";
