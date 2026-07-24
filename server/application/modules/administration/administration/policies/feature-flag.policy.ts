import type {
  FeatureFlag,
  MaintenanceMode,
} from "@server/application/modules/administration/administration/models";

/** Governs feature flag toggles under maintenance and platform constraints. */
export class FeatureFlagPolicy {
  assertCanUpdateFlag(
    flag: FeatureFlag,
    maintenance: MaintenanceMode,
    enabled: boolean,
  ): void {
    if (maintenance.enabled && enabled && this.isRestrictedDuringMaintenance(flag.key)) {
      throw new Error(
        `Feature flag ${flag.key} cannot be enabled while maintenance mode is active`,
      );
    }
  }

  isRestrictedDuringMaintenance(flagKey: string): boolean {
    const normalized = flagKey.trim().toLowerCase();
    return normalized === "checkout" || normalized === "marketplace_publish";
  }
}
