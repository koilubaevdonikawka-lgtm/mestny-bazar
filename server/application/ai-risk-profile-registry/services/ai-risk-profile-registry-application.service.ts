import type {
  RegisterRiskProfileInput,
  UpdateRiskProfileInput,
} from "@server/application/ai-risk-profile-registry/models/risk-profile.model";
import {
  DeleteRiskProfileUseCase,
  FindRiskProfileByNameUseCase,
  GetRiskProfileRegistryStatisticsUseCase,
  GetRiskProfileUseCase,
  ListRiskProfilesByCategoryUseCase,
  ListRiskProfilesUseCase,
  RegisterRiskProfileUseCase,
  UpdateRiskProfileUseCase,
} from "@server/application/ai-risk-profile-registry/use-cases/ai-risk-profile-registry.use-cases";

/** Application facade for AI Risk Profile Registry scenario. */
export class AiRiskProfileRegistryApplicationService {
  constructor(
    private readonly registerRiskProfileUseCase: RegisterRiskProfileUseCase,
    private readonly getRiskProfileUseCase: GetRiskProfileUseCase,
    private readonly listRiskProfilesUseCase: ListRiskProfilesUseCase,
    private readonly updateRiskProfileUseCase: UpdateRiskProfileUseCase,
    private readonly deleteRiskProfileUseCase: DeleteRiskProfileUseCase,
    private readonly findRiskProfileByNameUseCase: FindRiskProfileByNameUseCase,
    private readonly listRiskProfilesByCategoryUseCase: ListRiskProfilesByCategoryUseCase,
    private readonly getRiskProfileRegistryStatisticsUseCase: GetRiskProfileRegistryStatisticsUseCase,
  ) {}

  registerRiskProfile(input: RegisterRiskProfileInput) {
    return this.registerRiskProfileUseCase.execute(input);
  }

  getRiskProfile(riskProfileId: string) {
    return this.getRiskProfileUseCase.execute(riskProfileId);
  }

  listRiskProfiles() {
    return this.listRiskProfilesUseCase.execute();
  }

  updateRiskProfile(input: UpdateRiskProfileInput) {
    return this.updateRiskProfileUseCase.execute(input);
  }

  deleteRiskProfile(riskProfileId: string) {
    return this.deleteRiskProfileUseCase.execute(riskProfileId);
  }

  findRiskProfileByName(name: string) {
    return this.findRiskProfileByNameUseCase.execute(name);
  }

  listRiskProfilesByCategory(category: string) {
    return this.listRiskProfilesByCategoryUseCase.execute(category);
  }

  getRiskProfileRegistryStatistics() {
    return this.getRiskProfileRegistryStatisticsUseCase.execute();
  }
}
