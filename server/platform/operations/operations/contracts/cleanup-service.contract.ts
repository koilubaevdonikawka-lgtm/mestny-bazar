import type { MaintenanceResult } from "@server/platform/operations/operations/models";

export interface CleanupCategoryResult {
  readonly category: string;
  readonly removed: number;
}

/** Contract for platform cleanup operations. */
export interface ICleanupService {
  cleanup(): Promise<MaintenanceResult> | MaintenanceResult;
}
