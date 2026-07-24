import type {
  DeleteExplainabilityProfileResult,
  FindExplainabilityProfileByNameResult,
  ExplainabilityProfile,
  ExplainabilityProfileRegistryStatistics,
  ListExplainabilityProfilesByCategoryResult,
  ListExplainabilityProfilesResult,
  RegisterExplainabilityProfileInput,
  UpdateExplainabilityProfileInput,
} from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";
import type { AiExplainabilityProfileRegistryService } from "@server/application/ai-explainability-profile-registry/services/ai-explainability-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterExplainabilityProfileUseCase {
  constructor(private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryService) {}

  execute(input: RegisterExplainabilityProfileInput): Promise<UseCaseResult<ExplainabilityProfile>> {
    return this.explainabilityProfileRegistry.registerExplainabilityProfile(input).then(useCaseResult);
  }
}

export class GetExplainabilityProfileUseCase {
  constructor(private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryService) {}

  execute(explainabilityProfileId: string): Promise<UseCaseResult<ExplainabilityProfile | null>> {
    return this.explainabilityProfileRegistry.getExplainabilityProfile(explainabilityProfileId).then(useCaseResult);
  }
}

export class ListExplainabilityProfilesUseCase {
  constructor(private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListExplainabilityProfilesResult>> {
    return this.explainabilityProfileRegistry.listExplainabilityProfiles().then(useCaseResult);
  }
}

export class UpdateExplainabilityProfileUseCase {
  constructor(private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryService) {}

  execute(input: UpdateExplainabilityProfileInput): Promise<UseCaseResult<ExplainabilityProfile>> {
    return this.explainabilityProfileRegistry.updateExplainabilityProfile(input).then(useCaseResult);
  }
}

export class DeleteExplainabilityProfileUseCase {
  constructor(private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryService) {}

  execute(explainabilityProfileId: string): Promise<UseCaseResult<DeleteExplainabilityProfileResult>> {
    return this.explainabilityProfileRegistry.deleteExplainabilityProfile(explainabilityProfileId).then(useCaseResult);
  }
}

export class FindExplainabilityProfileByNameUseCase {
  constructor(private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindExplainabilityProfileByNameResult>> {
    return this.explainabilityProfileRegistry.findExplainabilityProfileByName(name).then(useCaseResult);
  }
}

export class ListExplainabilityProfilesByCategoryUseCase {
  constructor(private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListExplainabilityProfilesByCategoryResult>> {
    return this.explainabilityProfileRegistry.listExplainabilityProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetExplainabilityProfileRegistryStatisticsUseCase {
  constructor(private readonly explainabilityProfileRegistry: AiExplainabilityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ExplainabilityProfileRegistryStatistics>> {
    return this.explainabilityProfileRegistry.getExplainabilityProfileRegistryStatistics().then(useCaseResult);
  }
}
