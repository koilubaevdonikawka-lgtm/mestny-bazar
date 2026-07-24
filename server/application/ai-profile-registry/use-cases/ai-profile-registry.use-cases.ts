import type {
  DeleteProfileResult,
  FindProfileByNameResult,
  ListProfilesByTypeResult,
  ListProfilesResult,
  Profile,
  ProfileRegistryStatistics,
  RegisterProfileInput,
  UpdateProfileInput,
} from "@server/application/ai-profile-registry/models/profile.model";
import type { AiProfileRegistryService } from "@server/application/ai-profile-registry/services/ai-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterProfileUseCase {
  constructor(private readonly profileRegistry: AiProfileRegistryService) {}

  execute(input: RegisterProfileInput): Promise<UseCaseResult<Profile>> {
    return this.profileRegistry.registerProfile(input).then(useCaseResult);
  }
}

export class GetProfileUseCase {
  constructor(private readonly profileRegistry: AiProfileRegistryService) {}

  execute(profileId: string): Promise<UseCaseResult<Profile | null>> {
    return this.profileRegistry.getProfile(profileId).then(useCaseResult);
  }
}

export class ListProfilesUseCase {
  constructor(private readonly profileRegistry: AiProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListProfilesResult>> {
    return this.profileRegistry.listProfiles().then(useCaseResult);
  }
}

export class UpdateProfileUseCase {
  constructor(private readonly profileRegistry: AiProfileRegistryService) {}

  execute(input: UpdateProfileInput): Promise<UseCaseResult<Profile>> {
    return this.profileRegistry.updateProfile(input).then(useCaseResult);
  }
}

export class DeleteProfileUseCase {
  constructor(private readonly profileRegistry: AiProfileRegistryService) {}

  execute(profileId: string): Promise<UseCaseResult<DeleteProfileResult>> {
    return this.profileRegistry.deleteProfile(profileId).then(useCaseResult);
  }
}

export class FindProfileByNameUseCase {
  constructor(private readonly profileRegistry: AiProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindProfileByNameResult>> {
    return this.profileRegistry.findProfileByName(name).then(useCaseResult);
  }
}

export class ListProfilesByTypeUseCase {
  constructor(private readonly profileRegistry: AiProfileRegistryService) {}

  execute(type: string): Promise<UseCaseResult<ListProfilesByTypeResult>> {
    return this.profileRegistry.listProfilesByType(type).then(useCaseResult);
  }
}

export class GetProfileRegistryStatisticsUseCase {
  constructor(private readonly profileRegistry: AiProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ProfileRegistryStatistics>> {
    return this.profileRegistry.getProfileRegistryStatistics().then(useCaseResult);
  }
}
