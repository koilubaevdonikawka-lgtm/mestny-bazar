import type { ValidationProfileRegistryStatistics } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

export interface IValidationProfileStatisticsProvider {
  getStatistics(input: {
    totalValidationProfiles: number;
    activeValidationProfiles: number;
    categories: readonly string[];
  }): Promise<ValidationProfileRegistryStatistics>;
}
