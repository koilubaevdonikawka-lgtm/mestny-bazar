import type {
  DeleteAccountabilityProfileResult,
  FindAccountabilityProfileByNameResult,
  AccountabilityProfile,
  AccountabilityProfileRegistryStatistics,
  ListAccountabilityProfilesByCategoryResult,
  ListAccountabilityProfilesResult,
  RegisterAccountabilityProfileInput,
  UpdateAccountabilityProfileInput,
} from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";
import type { AiAccountabilityProfileRegistryService } from "@server/application/ai-accountability-profile-registry/services/ai-accountability-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterAccountabilityProfileUseCase {
  constructor(private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryService) {}

  execute(input: RegisterAccountabilityProfileInput): Promise<UseCaseResult<AccountabilityProfile>> {
    return this.accountabilityProfileRegistry.registerAccountabilityProfile(input).then(useCaseResult);
  }
}

export class GetAccountabilityProfileUseCase {
  constructor(private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryService) {}

  execute(accountabilityProfileId: string): Promise<UseCaseResult<AccountabilityProfile | null>> {
    return this.accountabilityProfileRegistry.getAccountabilityProfile(accountabilityProfileId).then(useCaseResult);
  }
}

export class ListAccountabilityProfilesUseCase {
  constructor(private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListAccountabilityProfilesResult>> {
    return this.accountabilityProfileRegistry.listAccountabilityProfiles().then(useCaseResult);
  }
}

export class UpdateAccountabilityProfileUseCase {
  constructor(private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryService) {}

  execute(input: UpdateAccountabilityProfileInput): Promise<UseCaseResult<AccountabilityProfile>> {
    return this.accountabilityProfileRegistry.updateAccountabilityProfile(input).then(useCaseResult);
  }
}

export class DeleteAccountabilityProfileUseCase {
  constructor(private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryService) {}

  execute(accountabilityProfileId: string): Promise<UseCaseResult<DeleteAccountabilityProfileResult>> {
    return this.accountabilityProfileRegistry.deleteAccountabilityProfile(accountabilityProfileId).then(useCaseResult);
  }
}

export class FindAccountabilityProfileByNameUseCase {
  constructor(private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindAccountabilityProfileByNameResult>> {
    return this.accountabilityProfileRegistry.findAccountabilityProfileByName(name).then(useCaseResult);
  }
}

export class ListAccountabilityProfilesByCategoryUseCase {
  constructor(private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListAccountabilityProfilesByCategoryResult>> {
    return this.accountabilityProfileRegistry.listAccountabilityProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetAccountabilityProfileRegistryStatisticsUseCase {
  constructor(private readonly accountabilityProfileRegistry: AiAccountabilityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<AccountabilityProfileRegistryStatistics>> {
    return this.accountabilityProfileRegistry.getAccountabilityProfileRegistryStatistics().then(useCaseResult);
  }
}
