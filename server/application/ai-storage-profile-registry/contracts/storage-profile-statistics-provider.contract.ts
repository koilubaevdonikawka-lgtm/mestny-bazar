import type { StorageProfileRegistryStatistics } from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

export interface IStorageProfileStatisticsProvider {
  getStatistics(input: {
    totalStorageProfiles: number;
    activeStorageProfiles: number;
    categories: readonly string[];
  }): Promise<StorageProfileRegistryStatistics>;
}
