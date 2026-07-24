export const MAINTENANCE_MODE_ID = "maintenance";

/** Platform maintenance mode state owned by Administration. */
export interface MaintenanceMode {
  readonly id: typeof MAINTENANCE_MODE_ID;
  readonly enabled: boolean;
  readonly message: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export function createDefaultMaintenanceMode(updatedBy = "system"): MaintenanceMode {
  const timestamp = new Date().toISOString();
  return Object.freeze({
    id: MAINTENANCE_MODE_ID,
    enabled: false,
    message: null,
    updatedAt: timestamp,
    updatedBy,
  });
}

export function withMaintenanceModeUpdate(
  mode: MaintenanceMode,
  input: {
    enabled: boolean;
    message?: string | null;
    updatedBy: string;
  },
): MaintenanceMode {
  return Object.freeze({
    ...mode,
    enabled: input.enabled,
    message: input.message === undefined ? mode.message : input.message?.trim() || null,
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy.trim(),
  });
}
