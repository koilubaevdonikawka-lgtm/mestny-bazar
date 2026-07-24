import type {
  RegisterEnvironmentProfileInput,
  UpdateEnvironmentProfileInput,
} from "@server/application/ai-environment-profile-registry/models/environment-profile.model";
import {
  DeleteEnvironmentProfileUseCase,
  FindEnvironmentProfileByNameUseCase,
  GetEnvironmentProfileRegistryStatisticsUseCase,
  GetEnvironmentProfileUseCase,
  ListEnvironmentProfilesByCategoryUseCase,
  ListEnvironmentProfilesUseCase,
  RegisterEnvironmentProfileUseCase,
  UpdateEnvironmentProfileUseCase,
} from "@server/application/ai-environment-profile-registry/use-cases/ai-environment-profile-registry.use-cases";

/** Application facade for AI Environment Profile Registry scenario. */
export class AiEnvironmentProfileRegistryApplicationService {
  constructor(
    private readonly registerEnvironmentProfileUseCase: RegisterEnvironmentProfileUseCase,
    private readonly getEnvironmentProfileUseCase: GetEnvironmentProfileUseCase,
    private readonly listEnvironmentProfilesUseCase: ListEnvironmentProfilesUseCase,
    private readonly updateEnvironmentProfileUseCase: UpdateEnvironmentProfileUseCase,
    private readonly deleteEnvironmentProfileUseCase: DeleteEnvironmentProfileUseCase,
    private readonly findEnvironmentProfileByNameUseCase: FindEnvironmentProfileByNameUseCase,
    private readonly listEnvironmentProfilesByCategoryUseCase: ListEnvironmentProfilesByCategoryUseCase,
    private readonly getEnvironmentProfileRegistryStatisticsUseCase: GetEnvironmentProfileRegistryStatisticsUseCase,
  ) {}

  registerEnvironmentProfile(input: RegisterEnvironmentProfileInput) {
    return this.registerEnvironmentProfileUseCase.execute(input);
  }

  getEnvironmentProfile(environmentProfileId: string) {
    return this.getEnvironmentProfileUseCase.execute(environmentProfileId);
  }

  listEnvironmentProfiles() {
    return this.listEnvironmentProfilesUseCase.execute();
  }

  updateEnvironmentProfile(input: UpdateEnvironmentProfileInput) {
    return this.updateEnvironmentProfileUseCase.execute(input);
  }

  deleteEnvironmentProfile(environmentProfileId: string) {
    return this.deleteEnvironmentProfileUseCase.execute(environmentProfileId);
  }

  findEnvironmentProfileByName(name: string) {
    return this.findEnvironmentProfileByNameUseCase.execute(name);
  }

  listEnvironmentProfilesByCategory(category: string) {
    return this.listEnvironmentProfilesByCategoryUseCase.execute(category);
  }

  getEnvironmentProfileRegistryStatistics() {
    return this.getEnvironmentProfileRegistryStatisticsUseCase.execute();
  }
}
