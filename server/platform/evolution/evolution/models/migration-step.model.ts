/** Single step within a migration plan. */
export interface MigrationStep {
  readonly order: number;
  readonly migrationId: string;
  readonly migrationName: string;
  readonly kind: string;
  readonly fromVersion: string;
  readonly toVersion: string;
}

export function createMigrationStep(input: {
  order: number;
  migrationId: string;
  migrationName: string;
  kind: string;
  fromVersion: string;
  toVersion: string;
}): MigrationStep {
  return Object.freeze({
    order: input.order,
    migrationId: input.migrationId.trim(),
    migrationName: input.migrationName.trim(),
    kind: input.kind.trim(),
    fromVersion: input.fromVersion.trim(),
    toVersion: input.toVersion.trim(),
  });
}
