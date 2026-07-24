import type { IFeatureFlagAuditProvider } from "@server/application/feature-flag-management/contracts/feature-flag-audit-provider.contract";
import type { FeatureFlag } from "@server/application/feature-flag-management/models/feature-flag.model";

/** No-op feature flag audit provider — reserved for future audit integration. */
export class NoopFeatureFlagAuditProvider implements IFeatureFlagAuditProvider {
  async recordChange(_action: string, _flag: FeatureFlag): Promise<void> {
    return;
  }
}
