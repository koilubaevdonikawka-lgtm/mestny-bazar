import type {
  RegisterEthicsProfileInput,
  UpdateEthicsProfileInput,
} from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";
import {
  DeleteEthicsProfileUseCase,
  FindEthicsProfileByNameUseCase,
  GetEthicsProfileRegistryStatisticsUseCase,
  GetEthicsProfileUseCase,
  ListEthicsProfilesByCategoryUseCase,
  ListEthicsProfilesUseCase,
  RegisterEthicsProfileUseCase,
  UpdateEthicsProfileUseCase,
} from "@server/application/ai-ethics-profile-registry/use-cases/ai-ethics-profile-registry.use-cases";

/** Application facade for AI Ethics Profile Registry scenario. */
export class AiEthicsProfileRegistryApplicationService {
  constructor(
    private readonly registerEthicsProfileUseCase: RegisterEthicsProfileUseCase,
    private readonly getEthicsProfileUseCase: GetEthicsProfileUseCase,
    private readonly listEthicsProfilesUseCase: ListEthicsProfilesUseCase,
    private readonly updateEthicsProfileUseCase: UpdateEthicsProfileUseCase,
    private readonly deleteEthicsProfileUseCase: DeleteEthicsProfileUseCase,
    private readonly findEthicsProfileByNameUseCase: FindEthicsProfileByNameUseCase,
    private readonly listEthicsProfilesByCategoryUseCase: ListEthicsProfilesByCategoryUseCase,
    private readonly getEthicsProfileRegistryStatisticsUseCase: GetEthicsProfileRegistryStatisticsUseCase,
  ) {}

  registerEthicsProfile(input: RegisterEthicsProfileInput) {
    return this.registerEthicsProfileUseCase.execute(input);
  }

  getEthicsProfile(ethicsProfileId: string) {
    return this.getEthicsProfileUseCase.execute(ethicsProfileId);
  }

  listEthicsProfiles() {
    return this.listEthicsProfilesUseCase.execute();
  }

  updateEthicsProfile(input: UpdateEthicsProfileInput) {
    return this.updateEthicsProfileUseCase.execute(input);
  }

  deleteEthicsProfile(ethicsProfileId: string) {
    return this.deleteEthicsProfileUseCase.execute(ethicsProfileId);
  }

  findEthicsProfileByName(name: string) {
    return this.findEthicsProfileByNameUseCase.execute(name);
  }

  listEthicsProfilesByCategory(category: string) {
    return this.listEthicsProfilesByCategoryUseCase.execute(category);
  }

  getEthicsProfileRegistryStatistics() {
    return this.getEthicsProfileRegistryStatisticsUseCase.execute();
  }
}
