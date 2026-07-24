import type {
  RegisterFairnessProfileInput,
  UpdateFairnessProfileInput,
} from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";
import {
  DeleteFairnessProfileUseCase,
  FindFairnessProfileByNameUseCase,
  GetFairnessProfileRegistryStatisticsUseCase,
  GetFairnessProfileUseCase,
  ListFairnessProfilesByCategoryUseCase,
  ListFairnessProfilesUseCase,
  RegisterFairnessProfileUseCase,
  UpdateFairnessProfileUseCase,
} from "@server/application/ai-fairness-profile-registry/use-cases/ai-fairness-profile-registry.use-cases";

/** Application facade for AI Fairness Profile Registry scenario. */
export class AiFairnessProfileRegistryApplicationService {
  constructor(
    private readonly registerFairnessProfileUseCase: RegisterFairnessProfileUseCase,
    private readonly getFairnessProfileUseCase: GetFairnessProfileUseCase,
    private readonly listFairnessProfilesUseCase: ListFairnessProfilesUseCase,
    private readonly updateFairnessProfileUseCase: UpdateFairnessProfileUseCase,
    private readonly deleteFairnessProfileUseCase: DeleteFairnessProfileUseCase,
    private readonly findFairnessProfileByNameUseCase: FindFairnessProfileByNameUseCase,
    private readonly listFairnessProfilesByCategoryUseCase: ListFairnessProfilesByCategoryUseCase,
    private readonly getFairnessProfileRegistryStatisticsUseCase: GetFairnessProfileRegistryStatisticsUseCase,
  ) {}

  registerFairnessProfile(input: RegisterFairnessProfileInput) {
    return this.registerFairnessProfileUseCase.execute(input);
  }

  getFairnessProfile(fairnessProfileId: string) {
    return this.getFairnessProfileUseCase.execute(fairnessProfileId);
  }

  listFairnessProfiles() {
    return this.listFairnessProfilesUseCase.execute();
  }

  updateFairnessProfile(input: UpdateFairnessProfileInput) {
    return this.updateFairnessProfileUseCase.execute(input);
  }

  deleteFairnessProfile(fairnessProfileId: string) {
    return this.deleteFairnessProfileUseCase.execute(fairnessProfileId);
  }

  findFairnessProfileByName(name: string) {
    return this.findFairnessProfileByNameUseCase.execute(name);
  }

  listFairnessProfilesByCategory(category: string) {
    return this.listFairnessProfilesByCategoryUseCase.execute(category);
  }

  getFairnessProfileRegistryStatistics() {
    return this.getFairnessProfileRegistryStatisticsUseCase.execute();
  }
}
