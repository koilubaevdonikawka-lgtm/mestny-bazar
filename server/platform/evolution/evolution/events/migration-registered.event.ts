import type { MigrationDescriptor } from "@server/platform/evolution/evolution/models";

/** Emitted when a migration is registered. */
export interface MigrationRegisteredEvent {
  readonly type: "evolution.migration.registered";
  readonly migration: MigrationDescriptor;
}

export function createMigrationRegisteredEvent(
  migration: MigrationDescriptor,
): MigrationRegisteredEvent {
  return Object.freeze({ type: "evolution.migration.registered", migration });
}
