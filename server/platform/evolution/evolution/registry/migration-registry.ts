import type { IMigrationRegistry } from "@server/platform/evolution/evolution/contracts";
import type { MigrationDescriptor, MigrationKind } from "@server/platform/evolution/evolution/models";
import { createMigrationRegisteredEvent } from "@server/platform/evolution/evolution/events";

/** Central registry for platform migrations. */
export class MigrationRegistry implements IMigrationRegistry {
  private readonly migrations = new Map<string, MigrationDescriptor>();

  register(migration: MigrationDescriptor): void {
    if (this.migrations.has(migration.id)) {
      throw new Error(`Migration already registered: ${migration.id}`);
    }
    this.migrations.set(migration.id, Object.freeze({ ...migration }));
    createMigrationRegisteredEvent(migration);
  }

  list(): readonly MigrationDescriptor[] {
    return Object.freeze([...this.migrations.values()]);
  }

  listByKind(kind: MigrationKind): readonly MigrationDescriptor[] {
    return Object.freeze([...this.migrations.values()].filter((m) => m.kind === kind));
  }

  get(migrationId: string): MigrationDescriptor | undefined {
    return this.migrations.get(migrationId.trim());
  }
}
