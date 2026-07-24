import type {
  DeleteFairnessProfileResult,
  FindFairnessProfileByNameResult,
  FairnessProfile,
  FairnessProfileRegistryStatistics,
  ListFairnessProfilesByCategoryResult,
  ListFairnessProfilesResult,
  RegisterFairnessProfileInput,
  UpdateFairnessProfileInput,
} from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";
import type { AiFairnessProfileRegistryService } from "@server/application/ai-fairness-profile-registry/services/ai-fairness-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterFairnessProfileUseCase {
  constructor(private readonly fairnessProfileRegistry: AiFairnessProfileRegistryService) {}

  execute(input: RegisterFairnessProfileInput): Promise<UseCaseResult<FairnessProfile>> {
    return this.fairnessProfileRegistry.registerFairnessProfile(input).then(useCaseResult);
  }
}

export class GetFairnessProfileUseCase {
  constructor(private readonly fairnessProfileRegistry: AiFairnessProfileRegistryService) {}

  execute(fairnessProfileId: string): Promise<UseCaseResult<FairnessProfile | null>> {
    return this.fairnessProfileRegistry.getFairnessProfile(fairnessProfileId).then(useCaseResult);
  }
}

export class ListFairnessProfilesUseCase {
  constructor(private readonly fairnessProfileRegistry: AiFairnessProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListFairnessProfilesResult>> {
    return this.fairnessProfileRegistry.listFairnessProfiles().then(useCaseResult);
  }
}

export class UpdateFairnessProfileUseCase {
  constructor(private readonly fairnessProfileRegistry: AiFairnessProfileRegistryService) {}

  execute(input: UpdateFairnessProfileInput): Promise<UseCaseResult<FairnessProfile>> {
    return this.fairnessProfileRegistry.updateFairnessProfile(input).then(useCaseResult);
  }
}

export class DeleteFairnessProfileUseCase {
  constructor(private readonly fairnessProfileRegistry: AiFairnessProfileRegistryService) {}

  execute(fairnessProfileId: string): Promise<UseCaseResult<DeleteFairnessProfileResult>> {
    return this.fairnessProfileRegistry.deleteFairnessProfile(fairnessProfileId).then(useCaseResult);
  }
}

export class FindFairnessProfileByNameUseCase {
  constructor(private readonly fairnessProfileRegistry: AiFairnessProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindFairnessProfileByNameResult>> {
    return this.fairnessProfileRegistry.findFairnessProfileByName(name).then(useCaseResult);
  }
}

export class ListFairnessProfilesByCategoryUseCase {
  constructor(private readonly fairnessProfileRegistry: AiFairnessProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListFairnessProfilesByCategoryResult>> {
    return this.fairnessProfileRegistry.listFairnessProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetFairnessProfileRegistryStatisticsUseCase {
  constructor(private readonly fairnessProfileRegistry: AiFairnessProfileRegistryService) {}

  execute(): Promise<UseCaseResult<FairnessProfileRegistryStatistics>> {
    return this.fairnessProfileRegistry.getFairnessProfileRegistryStatistics().then(useCaseResult);
  }
}
