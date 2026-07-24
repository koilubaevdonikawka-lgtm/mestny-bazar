import type { MigrationDescriptor, MigrationKind } from "@server/platform/evolution/evolution/models";

/** Contract for migration registration. */
export interface IMigrationRegistry {
  register(migration: MigrationDescriptor): void;
  list(): readonly MigrationDescriptor[];
  listByKind(kind: MigrationKind): readonly MigrationDescriptor[];
  get(migrationId: string): MigrationDescriptor | undefined;
}
