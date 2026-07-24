import type {
  RegisterComputeProfileInput,
  UpdateComputeProfileInput,
} from "@server/application/ai-compute-profile-registry/models/compute-profile.model";
import {
  DeleteComputeProfileUseCase,
  FindComputeProfileByNameUseCase,
  GetComputeProfileRegistryStatisticsUseCase,
  GetComputeProfileUseCase,
  ListComputeProfilesByCategoryUseCase,
  ListComputeProfilesUseCase,
  RegisterComputeProfileUseCase,
  UpdateComputeProfileUseCase,
} from "@server/application/ai-compute-profile-registry/use-cases/ai-compute-profile-registry.use-cases";

/** Application facade for AI Compute Profile Registry scenario. */
export class AiComputeProfileRegistryApplicationService {
  constructor(
    private readonly registerComputeProfileUseCase: RegisterComputeProfileUseCase,
    private readonly getComputeProfileUseCase: GetComputeProfileUseCase,
    private readonly listComputeProfilesUseCase: ListComputeProfilesUseCase,
    private readonly updateComputeProfileUseCase: UpdateComputeProfileUseCase,
    private readonly deleteComputeProfileUseCase: DeleteComputeProfileUseCase,
    private readonly findComputeProfileByNameUseCase: FindComputeProfileByNameUseCase,
    private readonly listComputeProfilesByCategoryUseCase: ListComputeProfilesByCategoryUseCase,
    private readonly getComputeProfileRegistryStatisticsUseCase: GetComputeProfileRegistryStatisticsUseCase,
  ) {}

  registerComputeProfile(input: RegisterComputeProfileInput) {
    return this.registerComputeProfileUseCase.execute(input);
  }

  getComputeProfile(computeProfileId: string) {
    return this.getComputeProfileUseCase.execute(computeProfileId);
  }

  listComputeProfiles() {
    return this.listComputeProfilesUseCase.execute();
  }

  updateComputeProfile(input: UpdateComputeProfileInput) {
    return this.updateComputeProfileUseCase.execute(input);
  }

  deleteComputeProfile(computeProfileId: string) {
    return this.deleteComputeProfileUseCase.execute(computeProfileId);
  }

  findComputeProfileByName(name: string) {
    return this.findComputeProfileByNameUseCase.execute(name);
  }

  listComputeProfilesByCategory(category: string) {
    return this.listComputeProfilesByCategoryUseCase.execute(category);
  }

  getComputeProfileRegistryStatistics() {
    return this.getComputeProfileRegistryStatisticsUseCase.execute();
  }
}
