import type {
  DeletePrivacyProfileResult,
  FindPrivacyProfileByNameResult,
  PrivacyProfile,
  PrivacyProfileRegistryStatistics,
  ListPrivacyProfilesByCategoryResult,
  ListPrivacyProfilesResult,
  RegisterPrivacyProfileInput,
  UpdatePrivacyProfileInput,
} from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";
import type { AiPrivacyProfileRegistryService } from "@server/application/ai-privacy-profile-registry/services/ai-privacy-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterPrivacyProfileUseCase {
  constructor(private readonly privacyProfileRegistry: AiPrivacyProfileRegistryService) {}

  execute(input: RegisterPrivacyProfileInput): Promise<UseCaseResult<PrivacyProfile>> {
    return this.privacyProfileRegistry.registerPrivacyProfile(input).then(useCaseResult);
  }
}

export class GetPrivacyProfileUseCase {
  constructor(private readonly privacyProfileRegistry: AiPrivacyProfileRegistryService) {}

  execute(privacyProfileId: string): Promise<UseCaseResult<PrivacyProfile | null>> {
    return this.privacyProfileRegistry.getPrivacyProfile(privacyProfileId).then(useCaseResult);
  }
}

export class ListPrivacyProfilesUseCase {
  constructor(private readonly privacyProfileRegistry: AiPrivacyProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListPrivacyProfilesResult>> {
    return this.privacyProfileRegistry.listPrivacyProfiles().then(useCaseResult);
  }
}

export class UpdatePrivacyProfileUseCase {
  constructor(private readonly privacyProfileRegistry: AiPrivacyProfileRegistryService) {}

  execute(input: UpdatePrivacyProfileInput): Promise<UseCaseResult<PrivacyProfile>> {
    return this.privacyProfileRegistry.updatePrivacyProfile(input).then(useCaseResult);
  }
}

export class DeletePrivacyProfileUseCase {
  constructor(private readonly privacyProfileRegistry: AiPrivacyProfileRegistryService) {}

  execute(privacyProfileId: string): Promise<UseCaseResult<DeletePrivacyProfileResult>> {
    return this.privacyProfileRegistry.deletePrivacyProfile(privacyProfileId).then(useCaseResult);
  }
}

export class FindPrivacyProfileByNameUseCase {
  constructor(private readonly privacyProfileRegistry: AiPrivacyProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindPrivacyProfileByNameResult>> {
    return this.privacyProfileRegistry.findPrivacyProfileByName(name).then(useCaseResult);
  }
}

export class ListPrivacyProfilesByCategoryUseCase {
  constructor(private readonly privacyProfileRegistry: AiPrivacyProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListPrivacyProfilesByCategoryResult>> {
    return this.privacyProfileRegistry.listPrivacyProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetPrivacyProfileRegistryStatisticsUseCase {
  constructor(private readonly privacyProfileRegistry: AiPrivacyProfileRegistryService) {}

  execute(): Promise<UseCaseResult<PrivacyProfileRegistryStatistics>> {
    return this.privacyProfileRegistry.getPrivacyProfileRegistryStatistics().then(useCaseResult);
  }
}
