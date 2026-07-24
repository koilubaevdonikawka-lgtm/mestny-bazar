import type {
  RegisterExplainabilityProfileInput,
  UpdateExplainabilityProfileInput,
} from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";
import {
  DeleteExplainabilityProfileUseCase,
  FindExplainabilityProfileByNameUseCase,
  GetExplainabilityProfileRegistryStatisticsUseCase,
  GetExplainabilityProfileUseCase,
  ListExplainabilityProfilesByCategoryUseCase,
  ListExplainabilityProfilesUseCase,
  RegisterExplainabilityProfileUseCase,
  UpdateExplainabilityProfileUseCase,
} from "@server/application/ai-explainability-profile-registry/use-cases/ai-explainability-profile-registry.use-cases";

/** Application facade for AI Explainability Profile Registry scenario. */
export class AiExplainabilityProfileRegistryApplicationService {
  constructor(
    private readonly registerExplainabilityProfileUseCase: RegisterExplainabilityProfileUseCase,
    private readonly getExplainabilityProfileUseCase: GetExplainabilityProfileUseCase,
    private readonly listExplainabilityProfilesUseCase: ListExplainabilityProfilesUseCase,
    private readonly updateExplainabilityProfileUseCase: UpdateExplainabilityProfileUseCase,
    private readonly deleteExplainabilityProfileUseCase: DeleteExplainabilityProfileUseCase,
    private readonly findExplainabilityProfileByNameUseCase: FindExplainabilityProfileByNameUseCase,
    private readonly listExplainabilityProfilesByCategoryUseCase: ListExplainabilityProfilesByCategoryUseCase,
    private readonly getExplainabilityProfileRegistryStatisticsUseCase: GetExplainabilityProfileRegistryStatisticsUseCase,
  ) {}

  registerExplainabilityProfile(input: RegisterExplainabilityProfileInput) {
    return this.registerExplainabilityProfileUseCase.execute(input);
  }

  getExplainabilityProfile(explainabilityProfileId: string) {
    return this.getExplainabilityProfileUseCase.execute(explainabilityProfileId);
  }

  listExplainabilityProfiles() {
    return this.listExplainabilityProfilesUseCase.execute();
  }

  updateExplainabilityProfile(input: UpdateExplainabilityProfileInput) {
    return this.updateExplainabilityProfileUseCase.execute(input);
  }

  deleteExplainabilityProfile(explainabilityProfileId: string) {
    return this.deleteExplainabilityProfileUseCase.execute(explainabilityProfileId);
  }

  findExplainabilityProfileByName(name: string) {
    return this.findExplainabilityProfileByNameUseCase.execute(name);
  }

  listExplainabilityProfilesByCategory(category: string) {
    return this.listExplainabilityProfilesByCategoryUseCase.execute(category);
  }

  getExplainabilityProfileRegistryStatistics() {
    return this.getExplainabilityProfileRegistryStatisticsUseCase.execute();
  }
}
