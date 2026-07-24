/** Admin permission grant within an administrative role. */
export interface AdminPermission {
  readonly key: string;
  readonly granted: boolean;
}

export function createAdminPermission(key: string, granted = true): AdminPermission {
  return Object.freeze({
    key: key.trim(),
    granted,
  });
}

export function normalizeAdminPermissions(keys: readonly string[]): readonly AdminPermission[] {
  return Object.freeze(
    keys
      .map((key) => key.trim())
      .filter(Boolean)
      .map((key) => createAdminPermission(key)),
  );
}
