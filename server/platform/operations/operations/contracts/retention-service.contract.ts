import type { MaintenanceResult, RetentionPolicy } from "@server/platform/operations/operations/models";

/** Contract for retention policy management and application. */
export interface IRetentionService {
  listPolicies(): readonly RetentionPolicy[];
  registerPolicy(policy: RetentionPolicy): void;
  applyRetention(): Promise<MaintenanceResult> | MaintenanceResult;
}
