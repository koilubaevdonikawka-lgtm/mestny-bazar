import type {
  DeleteTrustProfileResult,
  FindTrustProfileByNameResult,
  TrustProfile,
  TrustProfileRegistryStatistics,
  ListTrustProfilesByCategoryResult,
  ListTrustProfilesResult,
  RegisterTrustProfileInput,
  UpdateTrustProfileInput,
} from "@server/application/ai-trust-profile-registry/models/trust-profile.model";
import type { AiTrustProfileRegistryService } from "@server/application/ai-trust-profile-registry/services/ai-trust-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterTrustProfileUseCase {
  constructor(private readonly trustProfileRegistry: AiTrustProfileRegistryService) {}

  execute(input: RegisterTrustProfileInput): Promise<UseCaseResult<TrustProfile>> {
    return this.trustProfileRegistry.registerTrustProfile(input).then(useCaseResult);
  }
}

export class GetTrustProfileUseCase {
  constructor(private readonly trustProfileRegistry: AiTrustProfileRegistryService) {}

  execute(trustProfileId: string): Promise<UseCaseResult<TrustProfile | null>> {
    return this.trustProfileRegistry.getTrustProfile(trustProfileId).then(useCaseResult);
  }
}

export class ListTrustProfilesUseCase {
  constructor(private readonly trustProfileRegistry: AiTrustProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListTrustProfilesResult>> {
    return this.trustProfileRegistry.listTrustProfiles().then(useCaseResult);
  }
}

export class UpdateTrustProfileUseCase {
  constructor(private readonly trustProfileRegistry: AiTrustProfileRegistryService) {}

  execute(input: UpdateTrustProfileInput): Promise<UseCaseResult<TrustProfile>> {
    return this.trustProfileRegistry.updateTrustProfile(input).then(useCaseResult);
  }
}

export class DeleteTrustProfileUseCase {
  constructor(private readonly trustProfileRegistry: AiTrustProfileRegistryService) {}

  execute(trustProfileId: string): Promise<UseCaseResult<DeleteTrustProfileResult>> {
    return this.trustProfileRegistry.deleteTrustProfile(trustProfileId).then(useCaseResult);
  }
}

export class FindTrustProfileByNameUseCase {
  constructor(private readonly trustProfileRegistry: AiTrustProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindTrustProfileByNameResult>> {
    return this.trustProfileRegistry.findTrustProfileByName(name).then(useCaseResult);
  }
}

export class ListTrustProfilesByCategoryUseCase {
  constructor(private readonly trustProfileRegistry: AiTrustProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListTrustProfilesByCategoryResult>> {
    return this.trustProfileRegistry.listTrustProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetTrustProfileRegistryStatisticsUseCase {
  constructor(private readonly trustProfileRegistry: AiTrustProfileRegistryService) {}

  execute(): Promise<UseCaseResult<TrustProfileRegistryStatistics>> {
    return this.trustProfileRegistry.getTrustProfileRegistryStatistics().then(useCaseResult);
  }
}
