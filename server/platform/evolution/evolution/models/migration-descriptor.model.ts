export type MigrationKind =
  | "platform"
  | "provider"
  | "configuration"
  | "contract"
  | "documentation";

/** Registered migration descriptor. */
export interface MigrationDescriptor {
  readonly id: string;
  readonly name: string;
  readonly kind: MigrationKind;
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly registeredAt: string;
  readonly description?: string;
}

export function createMigrationDescriptor(input: {
  id: string;
  name: string;
  kind: MigrationKind;
  fromVersion: string;
  toVersion: string;
  description?: string;
}): MigrationDescriptor {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    kind: input.kind,
    fromVersion: input.fromVersion.trim(),
    toVersion: input.toVersion.trim(),
    registeredAt: new Date().toISOString(),
    description: input.description?.trim() || undefined,
  });
}
