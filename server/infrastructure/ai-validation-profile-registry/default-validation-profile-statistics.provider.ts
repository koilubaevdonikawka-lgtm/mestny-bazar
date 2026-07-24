import type { IValidationProfileStatisticsProvider } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-statistics-provider.contract";
import type { ValidationProfileRegistryStatistics } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

/** Default in-memory validation profile statistics provider. */
export class DefaultValidationProfileStatisticsProvider implements IValidationProfileStatisticsProvider {
  async getStatistics(input: {
    totalValidationProfiles: number;
    activeValidationProfiles: number;
    categories: readonly string[];
  }): Promise<ValidationProfileRegistryStatistics> {
    return Object.freeze({
      totalValidationProfiles: input.totalValidationProfiles,
      activeValidationProfiles: input.activeValidationProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
