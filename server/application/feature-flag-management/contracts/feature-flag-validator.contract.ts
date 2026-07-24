import type {
  FeatureFlag,
  RegisterFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@server/application/feature-flag-management/models/feature-flag.model";

export interface IFeatureFlagValidator {
  validateKey(key: string): void;
  validateRegistration(input: RegisterFeatureFlagInput): void;
  validateUpdate(flag: FeatureFlag, input: UpdateFeatureFlagInput): void;
}
