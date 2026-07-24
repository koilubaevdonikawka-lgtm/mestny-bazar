import type {
  RegisterSafetyProfileInput,
  UpdateSafetyProfileInput,
} from "@server/application/ai-safety-profile-registry/models/safety-profile.model";
import {
  DeleteSafetyProfileUseCase,
  FindSafetyProfileByNameUseCase,
  GetSafetyProfileRegistryStatisticsUseCase,
  GetSafetyProfileUseCase,
  ListSafetyProfilesByCategoryUseCase,
  ListSafetyProfilesUseCase,
  RegisterSafetyProfileUseCase,
  UpdateSafetyProfileUseCase,
} from "@server/application/ai-safety-profile-registry/use-cases/ai-safety-profile-registry.use-cases";

/** Application facade for AI Safety Profile Registry scenario. */
export class AiSafetyProfileRegistryApplicationService {
  constructor(
    private readonly registerSafetyProfileUseCase: RegisterSafetyProfileUseCase,
    private readonly getSafetyProfileUseCase: GetSafetyProfileUseCase,
    private readonly listSafetyProfilesUseCase: ListSafetyProfilesUseCase,
    private readonly updateSafetyProfileUseCase: UpdateSafetyProfileUseCase,
    private readonly deleteSafetyProfileUseCase: DeleteSafetyProfileUseCase,
    private readonly findSafetyProfileByNameUseCase: FindSafetyProfileByNameUseCase,
    private readonly listSafetyProfilesByCategoryUseCase: ListSafetyProfilesByCategoryUseCase,
    private readonly getSafetyProfileRegistryStatisticsUseCase: GetSafetyProfileRegistryStatisticsUseCase,
  ) {}

  registerSafetyProfile(input: RegisterSafetyProfileInput) {
    return this.registerSafetyProfileUseCase.execute(input);
  }

  getSafetyProfile(safetyProfileId: string) {
    return this.getSafetyProfileUseCase.execute(safetyProfileId);
  }

  listSafetyProfiles() {
    return this.listSafetyProfilesUseCase.execute();
  }

  updateSafetyProfile(input: UpdateSafetyProfileInput) {
    return this.updateSafetyProfileUseCase.execute(input);
  }

  deleteSafetyProfile(safetyProfileId: string) {
    return this.deleteSafetyProfileUseCase.execute(safetyProfileId);
  }

  findSafetyProfileByName(name: string) {
    return this.findSafetyProfileByNameUseCase.execute(name);
  }

  listSafetyProfilesByCategory(category: string) {
    return this.listSafetyProfilesByCategoryUseCase.execute(category);
  }

  getSafetyProfileRegistryStatistics() {
    return this.getSafetyProfileRegistryStatisticsUseCase.execute();
  }
}
