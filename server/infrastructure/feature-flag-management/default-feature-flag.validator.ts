import type { IFeatureFlagValidator } from "@server/application/feature-flag-management/contracts/feature-flag-validator.contract";
import type {
  FeatureFlag,
  RegisterFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@server/application/feature-flag-management/models/feature-flag.model";

/** Default feature flag validator — key and input constraints. */
export class DefaultFeatureFlagValidator implements IFeatureFlagValidator {
  validateKey(key: string): void {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      throw new Error("Feature flag key is required.");
    }
    if (normalizedKey.length > 256) {
      throw new Error("Feature flag key must not exceed 256 characters.");
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(normalizedKey)) {
      throw new Error(
        "Feature flag key may only contain letters, numbers, dots, underscores, and hyphens.",
      );
    }
  }

  validateRegistration(input: RegisterFeatureFlagInput): void {
    this.validateKey(input.key);
    if (!input.name.trim()) {
      throw new Error("Feature flag name is required.");
    }
  }

  validateUpdate(_flag: FeatureFlag, input: UpdateFeatureFlagInput): void {
    this.validateKey(input.key);
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("Feature flag name must not be empty.");
    }
  }
}
