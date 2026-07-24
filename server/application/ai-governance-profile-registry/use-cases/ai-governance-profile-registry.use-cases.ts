import type {
  DeleteGovernanceProfileResult,
  FindGovernanceProfileByNameResult,
  GovernanceProfile,
  GovernanceProfileRegistryStatistics,
  ListGovernanceProfilesByCategoryResult,
  ListGovernanceProfilesResult,
  RegisterGovernanceProfileInput,
  UpdateGovernanceProfileInput,
} from "@server/application/ai-governance-profile-registry/models/governance-profile.model";
import type { AiGovernanceProfileRegistryService } from "@server/application/ai-governance-profile-registry/services/ai-governance-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterGovernanceProfileUseCase {
  constructor(private readonly governanceProfileRegistry: AiGovernanceProfileRegistryService) {}

  execute(input: RegisterGovernanceProfileInput): Promise<UseCaseResult<GovernanceProfile>> {
    return this.governanceProfileRegistry.registerGovernanceProfile(input).then(useCaseResult);
  }
}

export class GetGovernanceProfileUseCase {
  constructor(private readonly governanceProfileRegistry: AiGovernanceProfileRegistryService) {}

  execute(governanceProfileId: string): Promise<UseCaseResult<GovernanceProfile | null>> {
    return this.governanceProfileRegistry.getGovernanceProfile(governanceProfileId).then(useCaseResult);
  }
}

export class ListGovernanceProfilesUseCase {
  constructor(private readonly governanceProfileRegistry: AiGovernanceProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListGovernanceProfilesResult>> {
    return this.governanceProfileRegistry.listGovernanceProfiles().then(useCaseResult);
  }
}

export class UpdateGovernanceProfileUseCase {
  constructor(private readonly governanceProfileRegistry: AiGovernanceProfileRegistryService) {}

  execute(input: UpdateGovernanceProfileInput): Promise<UseCaseResult<GovernanceProfile>> {
    return this.governanceProfileRegistry.updateGovernanceProfile(input).then(useCaseResult);
  }
}

export class DeleteGovernanceProfileUseCase {
  constructor(private readonly governanceProfileRegistry: AiGovernanceProfileRegistryService) {}

  execute(governanceProfileId: string): Promise<UseCaseResult<DeleteGovernanceProfileResult>> {
    return this.governanceProfileRegistry.deleteGovernanceProfile(governanceProfileId).then(useCaseResult);
  }
}

export class FindGovernanceProfileByNameUseCase {
  constructor(private readonly governanceProfileRegistry: AiGovernanceProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindGovernanceProfileByNameResult>> {
    return this.governanceProfileRegistry.findGovernanceProfileByName(name).then(useCaseResult);
  }
}

export class ListGovernanceProfilesByCategoryUseCase {
  constructor(private readonly governanceProfileRegistry: AiGovernanceProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListGovernanceProfilesByCategoryResult>> {
    return this.governanceProfileRegistry.listGovernanceProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetGovernanceProfileRegistryStatisticsUseCase {
  constructor(private readonly governanceProfileRegistry: AiGovernanceProfileRegistryService) {}

  execute(): Promise<UseCaseResult<GovernanceProfileRegistryStatistics>> {
    return this.governanceProfileRegistry.getGovernanceProfileRegistryStatistics().then(useCaseResult);
  }
}
