import type {
  RegisterInfrastructureProfileInput,
  UpdateInfrastructureProfileInput,
} from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";
import {
  DeleteInfrastructureProfileUseCase,
  FindInfrastructureProfileByNameUseCase,
  GetInfrastructureProfileRegistryStatisticsUseCase,
  GetInfrastructureProfileUseCase,
  ListInfrastructureProfilesByCategoryUseCase,
  ListInfrastructureProfilesUseCase,
  RegisterInfrastructureProfileUseCase,
  UpdateInfrastructureProfileUseCase,
} from "@server/application/ai-infrastructure-profile-registry/use-cases/ai-infrastructure-profile-registry.use-cases";

/** Application facade for AI Infrastructure Profile Registry scenario. */
export class AiInfrastructureProfileRegistryApplicationService {
  constructor(
    private readonly registerInfrastructureProfileUseCase: RegisterInfrastructureProfileUseCase,
    private readonly getInfrastructureProfileUseCase: GetInfrastructureProfileUseCase,
    private readonly listInfrastructureProfilesUseCase: ListInfrastructureProfilesUseCase,
    private readonly updateInfrastructureProfileUseCase: UpdateInfrastructureProfileUseCase,
    private readonly deleteInfrastructureProfileUseCase: DeleteInfrastructureProfileUseCase,
    private readonly findInfrastructureProfileByNameUseCase: FindInfrastructureProfileByNameUseCase,
    private readonly listInfrastructureProfilesByCategoryUseCase: ListInfrastructureProfilesByCategoryUseCase,
    private readonly getInfrastructureProfileRegistryStatisticsUseCase: GetInfrastructureProfileRegistryStatisticsUseCase,
  ) {}

  registerInfrastructureProfile(input: RegisterInfrastructureProfileInput) {
    return this.registerInfrastructureProfileUseCase.execute(input);
  }

  getInfrastructureProfile(infrastructureProfileId: string) {
    return this.getInfrastructureProfileUseCase.execute(infrastructureProfileId);
  }

  listInfrastructureProfiles() {
    return this.listInfrastructureProfilesUseCase.execute();
  }

  updateInfrastructureProfile(input: UpdateInfrastructureProfileInput) {
    return this.updateInfrastructureProfileUseCase.execute(input);
  }

  deleteInfrastructureProfile(infrastructureProfileId: string) {
    return this.deleteInfrastructureProfileUseCase.execute(infrastructureProfileId);
  }

  findInfrastructureProfileByName(name: string) {
    return this.findInfrastructureProfileByNameUseCase.execute(name);
  }

  listInfrastructureProfilesByCategory(category: string) {
    return this.listInfrastructureProfilesByCategoryUseCase.execute(category);
  }

  getInfrastructureProfileRegistryStatistics() {
    return this.getInfrastructureProfileRegistryStatisticsUseCase.execute();
  }
}
