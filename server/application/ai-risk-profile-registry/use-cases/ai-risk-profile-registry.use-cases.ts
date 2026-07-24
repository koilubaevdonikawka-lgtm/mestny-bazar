import type {
  DeleteRiskProfileResult,
  FindRiskProfileByNameResult,
  RiskProfile,
  RiskProfileRegistryStatistics,
  ListRiskProfilesByCategoryResult,
  ListRiskProfilesResult,
  RegisterRiskProfileInput,
  UpdateRiskProfileInput,
} from "@server/application/ai-risk-profile-registry/models/risk-profile.model";
import type { AiRiskProfileRegistryService } from "@server/application/ai-risk-profile-registry/services/ai-risk-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterRiskProfileUseCase {
  constructor(private readonly riskProfileRegistry: AiRiskProfileRegistryService) {}

  execute(input: RegisterRiskProfileInput): Promise<UseCaseResult<RiskProfile>> {
    return this.riskProfileRegistry.registerRiskProfile(input).then(useCaseResult);
  }
}

export class GetRiskProfileUseCase {
  constructor(private readonly riskProfileRegistry: AiRiskProfileRegistryService) {}

  execute(riskProfileId: string): Promise<UseCaseResult<RiskProfile | null>> {
    return this.riskProfileRegistry.getRiskProfile(riskProfileId).then(useCaseResult);
  }
}

export class ListRiskProfilesUseCase {
  constructor(private readonly riskProfileRegistry: AiRiskProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListRiskProfilesResult>> {
    return this.riskProfileRegistry.listRiskProfiles().then(useCaseResult);
  }
}

export class UpdateRiskProfileUseCase {
  constructor(private readonly riskProfileRegistry: AiRiskProfileRegistryService) {}

  execute(input: UpdateRiskProfileInput): Promise<UseCaseResult<RiskProfile>> {
    return this.riskProfileRegistry.updateRiskProfile(input).then(useCaseResult);
  }
}

export class DeleteRiskProfileUseCase {
  constructor(private readonly riskProfileRegistry: AiRiskProfileRegistryService) {}

  execute(riskProfileId: string): Promise<UseCaseResult<DeleteRiskProfileResult>> {
    return this.riskProfileRegistry.deleteRiskProfile(riskProfileId).then(useCaseResult);
  }
}

export class FindRiskProfileByNameUseCase {
  constructor(private readonly riskProfileRegistry: AiRiskProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindRiskProfileByNameResult>> {
    return this.riskProfileRegistry.findRiskProfileByName(name).then(useCaseResult);
  }
}

export class ListRiskProfilesByCategoryUseCase {
  constructor(private readonly riskProfileRegistry: AiRiskProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListRiskProfilesByCategoryResult>> {
    return this.riskProfileRegistry.listRiskProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetRiskProfileRegistryStatisticsUseCase {
  constructor(private readonly riskProfileRegistry: AiRiskProfileRegistryService) {}

  execute(): Promise<UseCaseResult<RiskProfileRegistryStatistics>> {
    return this.riskProfileRegistry.getRiskProfileRegistryStatistics().then(useCaseResult);
  }
}
