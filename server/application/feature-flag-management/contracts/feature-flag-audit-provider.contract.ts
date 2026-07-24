import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

export interface IFeatureFlagAuditProvider {
  recordChange(action: string, flag: FeatureFlag): Promise<void>;
}
