import type { IStorageProfileStatisticsProvider } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-statistics-provider.contract";
import type { StorageProfileRegistryStatistics } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

/** Default in-memory storage profile statistics provider. */
export class DefaultStorageProfileStatisticsProvider implements IStorageProfileStatisticsProvider {
  async getStatistics(input: {
    totalStorageProfiles: number;
    activeStorageProfiles: number;
    categories: readonly string[];
  }): Promise<StorageProfileRegistryStatistics> {
    return Object.freeze({
      totalStorageProfiles: input.totalStorageProfiles,
      activeStorageProfiles: input.activeStorageProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
