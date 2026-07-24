import type {
  RegisterResourceProfileInput,
  UpdateResourceProfileInput,
} from "@server/application/ai-resource-profile-registry/models/resource-profile.model";
import {
  DeleteResourceProfileUseCase,
  FindResourceProfileByNameUseCase,
  GetResourceProfileRegistryStatisticsUseCase,
  GetResourceProfileUseCase,
  ListResourceProfilesByCategoryUseCase,
  ListResourceProfilesUseCase,
  RegisterResourceProfileUseCase,
  UpdateResourceProfileUseCase,
} from "@server/application/ai-resource-profile-registry/use-cases/ai-resource-profile-registry.use-cases";

/** Application facade for AI Resource Profile Registry scenario. */
export class AiResourceProfileRegistryApplicationService {
  constructor(
    private readonly registerResourceProfileUseCase: RegisterResourceProfileUseCase,
    private readonly getResourceProfileUseCase: GetResourceProfileUseCase,
    private readonly listResourceProfilesUseCase: ListResourceProfilesUseCase,
    private readonly updateResourceProfileUseCase: UpdateResourceProfileUseCase,
    private readonly deleteResourceProfileUseCase: DeleteResourceProfileUseCase,
    private readonly findResourceProfileByNameUseCase: FindResourceProfileByNameUseCase,
    private readonly listResourceProfilesByCategoryUseCase: ListResourceProfilesByCategoryUseCase,
    private readonly getResourceProfileRegistryStatisticsUseCase: GetResourceProfileRegistryStatisticsUseCase,
  ) {}

  registerResourceProfile(input: RegisterResourceProfileInput) {
    return this.registerResourceProfileUseCase.execute(input);
  }

  getResourceProfile(resourceProfileId: string) {
    return this.getResourceProfileUseCase.execute(resourceProfileId);
  }

  listResourceProfiles() {
    return this.listResourceProfilesUseCase.execute();
  }

  updateResourceProfile(input: UpdateResourceProfileInput) {
    return this.updateResourceProfileUseCase.execute(input);
  }

  deleteResourceProfile(resourceProfileId: string) {
    return this.deleteResourceProfileUseCase.execute(resourceProfileId);
  }

  findResourceProfileByName(name: string) {
    return this.findResourceProfileByNameUseCase.execute(name);
  }

  listResourceProfilesByCategory(category: string) {
    return this.listResourceProfilesByCategoryUseCase.execute(category);
  }

  getResourceProfileRegistryStatistics() {
    return this.getResourceProfileRegistryStatisticsUseCase.execute();
  }
}
