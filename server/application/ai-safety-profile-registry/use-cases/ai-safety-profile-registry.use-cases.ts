import type {
  DeleteSafetyProfileResult,
  FindSafetyProfileByNameResult,
  SafetyProfile,
  SafetyProfileRegistryStatistics,
  ListSafetyProfilesByCategoryResult,
  ListSafetyProfilesResult,
  RegisterSafetyProfileInput,
  UpdateSafetyProfileInput,
} from "@server/application/ai-safety-profile-registry/models/safety-profile.model";
import type { AiSafetyProfileRegistryService } from "@server/application/ai-safety-profile-registry/services/ai-safety-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSafetyProfileUseCase {
  constructor(private readonly safetyProfileRegistry: AiSafetyProfileRegistryService) {}

  execute(input: RegisterSafetyProfileInput): Promise<UseCaseResult<SafetyProfile>> {
    return this.safetyProfileRegistry.registerSafetyProfile(input).then(useCaseResult);
  }
}

export class GetSafetyProfileUseCase {
  constructor(private readonly safetyProfileRegistry: AiSafetyProfileRegistryService) {}

  execute(safetyProfileId: string): Promise<UseCaseResult<SafetyProfile | null>> {
    return this.safetyProfileRegistry.getSafetyProfile(safetyProfileId).then(useCaseResult);
  }
}

export class ListSafetyProfilesUseCase {
  constructor(private readonly safetyProfileRegistry: AiSafetyProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListSafetyProfilesResult>> {
    return this.safetyProfileRegistry.listSafetyProfiles().then(useCaseResult);
  }
}

export class UpdateSafetyProfileUseCase {
  constructor(private readonly safetyProfileRegistry: AiSafetyProfileRegistryService) {}

  execute(input: UpdateSafetyProfileInput): Promise<UseCaseResult<SafetyProfile>> {
    return this.safetyProfileRegistry.updateSafetyProfile(input).then(useCaseResult);
  }
}

export class DeleteSafetyProfileUseCase {
  constructor(private readonly safetyProfileRegistry: AiSafetyProfileRegistryService) {}

  execute(safetyProfileId: string): Promise<UseCaseResult<DeleteSafetyProfileResult>> {
    return this.safetyProfileRegistry.deleteSafetyProfile(safetyProfileId).then(useCaseResult);
  }
}

export class FindSafetyProfileByNameUseCase {
  constructor(private readonly safetyProfileRegistry: AiSafetyProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindSafetyProfileByNameResult>> {
    return this.safetyProfileRegistry.findSafetyProfileByName(name).then(useCaseResult);
  }
}

export class ListSafetyProfilesByCategoryUseCase {
  constructor(private readonly safetyProfileRegistry: AiSafetyProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListSafetyProfilesByCategoryResult>> {
    return this.safetyProfileRegistry.listSafetyProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetSafetyProfileRegistryStatisticsUseCase {
  constructor(private readonly safetyProfileRegistry: AiSafetyProfileRegistryService) {}

  execute(): Promise<UseCaseResult<SafetyProfileRegistryStatistics>> {
    return this.safetyProfileRegistry.getSafetyProfileRegistryStatistics().then(useCaseResult);
  }
}
