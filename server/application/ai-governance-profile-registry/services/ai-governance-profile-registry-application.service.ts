import type {
  RegisterGovernanceProfileInput,
  UpdateGovernanceProfileInput,
} from "@server/application/ai-governance-profile-registry/models/governance-profile.model";
import {
  DeleteGovernanceProfileUseCase,
  FindGovernanceProfileByNameUseCase,
  GetGovernanceProfileRegistryStatisticsUseCase,
  GetGovernanceProfileUseCase,
  ListGovernanceProfilesByCategoryUseCase,
  ListGovernanceProfilesUseCase,
  RegisterGovernanceProfileUseCase,
  UpdateGovernanceProfileUseCase,
} from "@server/application/ai-governance-profile-registry/use-cases/ai-governance-profile-registry.use-cases";

/** Application facade for AI Governance Profile Registry scenario. */
export class AiGovernanceProfileRegistryApplicationService {
  constructor(
    private readonly registerGovernanceProfileUseCase: RegisterGovernanceProfileUseCase,
    private readonly getGovernanceProfileUseCase: GetGovernanceProfileUseCase,
    private readonly listGovernanceProfilesUseCase: ListGovernanceProfilesUseCase,
    private readonly updateGovernanceProfileUseCase: UpdateGovernanceProfileUseCase,
    private readonly deleteGovernanceProfileUseCase: DeleteGovernanceProfileUseCase,
    private readonly findGovernanceProfileByNameUseCase: FindGovernanceProfileByNameUseCase,
    private readonly listGovernanceProfilesByCategoryUseCase: ListGovernanceProfilesByCategoryUseCase,
    private readonly getGovernanceProfileRegistryStatisticsUseCase: GetGovernanceProfileRegistryStatisticsUseCase,
  ) {}

  registerGovernanceProfile(input: RegisterGovernanceProfileInput) {
    return this.registerGovernanceProfileUseCase.execute(input);
  }

  getGovernanceProfile(governanceProfileId: string) {
    return this.getGovernanceProfileUseCase.execute(governanceProfileId);
  }

  listGovernanceProfiles() {
    return this.listGovernanceProfilesUseCase.execute();
  }

  updateGovernanceProfile(input: UpdateGovernanceProfileInput) {
    return this.updateGovernanceProfileUseCase.execute(input);
  }

  deleteGovernanceProfile(governanceProfileId: string) {
    return this.deleteGovernanceProfileUseCase.execute(governanceProfileId);
  }

  findGovernanceProfileByName(name: string) {
    return this.findGovernanceProfileByNameUseCase.execute(name);
  }

  listGovernanceProfilesByCategory(category: string) {
    return this.listGovernanceProfilesByCategoryUseCase.execute(category);
  }

  getGovernanceProfileRegistryStatistics() {
    return this.getGovernanceProfileRegistryStatisticsUseCase.execute();
  }
}
