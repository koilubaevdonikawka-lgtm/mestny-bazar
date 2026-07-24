import type {
  RegisterServiceProfileInput,
  UpdateServiceProfileInput,
} from "@server/application/ai-service-profile-registry/models/service-profile.model";
import {
  DeleteServiceProfileUseCase,
  FindServiceProfileByNameUseCase,
  GetServiceProfileRegistryStatisticsUseCase,
  GetServiceProfileUseCase,
  ListServiceProfilesByCategoryUseCase,
  ListServiceProfilesUseCase,
  RegisterServiceProfileUseCase,
  UpdateServiceProfileUseCase,
} from "@server/application/ai-service-profile-registry/use-cases/ai-service-profile-registry.use-cases";

/** Application facade for AI Service Profile Registry scenario. */
export class AiServiceProfileRegistryApplicationService {
  constructor(
    private readonly registerServiceProfileUseCase: RegisterServiceProfileUseCase,
    private readonly getServiceProfileUseCase: GetServiceProfileUseCase,
    private readonly listServiceProfilesUseCase: ListServiceProfilesUseCase,
    private readonly updateServiceProfileUseCase: UpdateServiceProfileUseCase,
    private readonly deleteServiceProfileUseCase: DeleteServiceProfileUseCase,
    private readonly findServiceProfileByNameUseCase: FindServiceProfileByNameUseCase,
    private readonly listServiceProfilesByCategoryUseCase: ListServiceProfilesByCategoryUseCase,
    private readonly getServiceProfileRegistryStatisticsUseCase: GetServiceProfileRegistryStatisticsUseCase,
  ) {}

  registerServiceProfile(input: RegisterServiceProfileInput) {
    return this.registerServiceProfileUseCase.execute(input);
  }

  getServiceProfile(serviceProfileId: string) {
    return this.getServiceProfileUseCase.execute(serviceProfileId);
  }

  listServiceProfiles() {
    return this.listServiceProfilesUseCase.execute();
  }

  updateServiceProfile(input: UpdateServiceProfileInput) {
    return this.updateServiceProfileUseCase.execute(input);
  }

  deleteServiceProfile(serviceProfileId: string) {
    return this.deleteServiceProfileUseCase.execute(serviceProfileId);
  }

  findServiceProfileByName(name: string) {
    return this.findServiceProfileByNameUseCase.execute(name);
  }

  listServiceProfilesByCategory(category: string) {
    return this.listServiceProfilesByCategoryUseCase.execute(category);
  }

  getServiceProfileRegistryStatistics() {
    return this.getServiceProfileRegistryStatisticsUseCase.execute();
  }
}
