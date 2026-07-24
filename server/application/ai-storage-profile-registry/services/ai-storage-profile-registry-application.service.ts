import type {
  RegisterStorageProfileInput,
  UpdateStorageProfileInput,
} from "@server/application/ai-storage-profile-registry/models/storage-profile.model";
import {
  DeleteStorageProfileUseCase,
  FindStorageProfileByNameUseCase,
  GetStorageProfileRegistryStatisticsUseCase,
  GetStorageProfileUseCase,
  ListStorageProfilesByCategoryUseCase,
  ListStorageProfilesUseCase,
  RegisterStorageProfileUseCase,
  UpdateStorageProfileUseCase,
} from "@server/application/ai-storage-profile-registry/use-cases/ai-storage-profile-registry.use-cases";

/** Application facade for AI Storage Profile Registry scenario. */
export class AiStorageProfileRegistryApplicationService {
  constructor(
    private readonly registerStorageProfileUseCase: RegisterStorageProfileUseCase,
    private readonly getStorageProfileUseCase: GetStorageProfileUseCase,
    private readonly listStorageProfilesUseCase: ListStorageProfilesUseCase,
    private readonly updateStorageProfileUseCase: UpdateStorageProfileUseCase,
    private readonly deleteStorageProfileUseCase: DeleteStorageProfileUseCase,
    private readonly findStorageProfileByNameUseCase: FindStorageProfileByNameUseCase,
    private readonly listStorageProfilesByCategoryUseCase: ListStorageProfilesByCategoryUseCase,
    private readonly getStorageProfileRegistryStatisticsUseCase: GetStorageProfileRegistryStatisticsUseCase,
  ) {}

  registerStorageProfile(input: RegisterStorageProfileInput) {
    return this.registerStorageProfileUseCase.execute(input);
  }

  getStorageProfile(storageProfileId: string) {
    return this.getStorageProfileUseCase.execute(storageProfileId);
  }

  listStorageProfiles() {
    return this.listStorageProfilesUseCase.execute();
  }

  updateStorageProfile(input: UpdateStorageProfileInput) {
    return this.updateStorageProfileUseCase.execute(input);
  }

  deleteStorageProfile(storageProfileId: string) {
    return this.deleteStorageProfileUseCase.execute(storageProfileId);
  }

  findStorageProfileByName(name: string) {
    return this.findStorageProfileByNameUseCase.execute(name);
  }

  listStorageProfilesByCategory(category: string) {
    return this.listStorageProfilesByCategoryUseCase.execute(category);
  }

  getStorageProfileRegistryStatistics() {
    return this.getStorageProfileRegistryStatisticsUseCase.execute();
  }
}
