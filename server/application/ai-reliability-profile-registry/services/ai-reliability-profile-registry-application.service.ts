import type {
  RegisterReliabilityProfileInput,
  UpdateReliabilityProfileInput,
} from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";
import {
  DeleteReliabilityProfileUseCase,
  FindReliabilityProfileByNameUseCase,
  GetReliabilityProfileRegistryStatisticsUseCase,
  GetReliabilityProfileUseCase,
  ListReliabilityProfilesByCategoryUseCase,
  ListReliabilityProfilesUseCase,
  RegisterReliabilityProfileUseCase,
  UpdateReliabilityProfileUseCase,
} from "@server/application/ai-reliability-profile-registry/use-cases/ai-reliability-profile-registry.use-cases";

/** Application facade for AI Reliability Profile Registry scenario. */
export class AiReliabilityProfileRegistryApplicationService {
  constructor(
    private readonly registerReliabilityProfileUseCase: RegisterReliabilityProfileUseCase,
    private readonly getReliabilityProfileUseCase: GetReliabilityProfileUseCase,
    private readonly listReliabilityProfilesUseCase: ListReliabilityProfilesUseCase,
    private readonly updateReliabilityProfileUseCase: UpdateReliabilityProfileUseCase,
    private readonly deleteReliabilityProfileUseCase: DeleteReliabilityProfileUseCase,
    private readonly findReliabilityProfileByNameUseCase: FindReliabilityProfileByNameUseCase,
    private readonly listReliabilityProfilesByCategoryUseCase: ListReliabilityProfilesByCategoryUseCase,
    private readonly getReliabilityProfileRegistryStatisticsUseCase: GetReliabilityProfileRegistryStatisticsUseCase,
  ) {}

  registerReliabilityProfile(input: RegisterReliabilityProfileInput) {
    return this.registerReliabilityProfileUseCase.execute(input);
  }

  getReliabilityProfile(reliabilityProfileId: string) {
    return this.getReliabilityProfileUseCase.execute(reliabilityProfileId);
  }

  listReliabilityProfiles() {
    return this.listReliabilityProfilesUseCase.execute();
  }

  updateReliabilityProfile(input: UpdateReliabilityProfileInput) {
    return this.updateReliabilityProfileUseCase.execute(input);
  }

  deleteReliabilityProfile(reliabilityProfileId: string) {
    return this.deleteReliabilityProfileUseCase.execute(reliabilityProfileId);
  }

  findReliabilityProfileByName(name: string) {
    return this.findReliabilityProfileByNameUseCase.execute(name);
  }

  listReliabilityProfilesByCategory(category: string) {
    return this.listReliabilityProfilesByCategoryUseCase.execute(category);
  }

  getReliabilityProfileRegistryStatistics() {
    return this.getReliabilityProfileRegistryStatisticsUseCase.execute();
  }
}
