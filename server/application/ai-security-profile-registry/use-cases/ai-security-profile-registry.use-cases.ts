import type {
  DeleteSecurityProfileResult,
  FindSecurityProfileByNameResult,
  SecurityProfile,
  SecurityProfileRegistryStatistics,
  ListSecurityProfilesByCategoryResult,
  ListSecurityProfilesResult,
  RegisterSecurityProfileInput,
  UpdateSecurityProfileInput,
} from "@server/application/ai-security-profile-registry/models/security-profile.model";
import type { AiSecurityProfileRegistryService } from "@server/application/ai-security-profile-registry/services/ai-security-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSecurityProfileUseCase {
  constructor(private readonly securityProfileRegistry: AiSecurityProfileRegistryService) {}

  execute(input: RegisterSecurityProfileInput): Promise<UseCaseResult<SecurityProfile>> {
    return this.securityProfileRegistry.registerSecurityProfile(input).then(useCaseResult);
  }
}

export class GetSecurityProfileUseCase {
  constructor(private readonly securityProfileRegistry: AiSecurityProfileRegistryService) {}

  execute(securityProfileId: string): Promise<UseCaseResult<SecurityProfile | null>> {
    return this.securityProfileRegistry.getSecurityProfile(securityProfileId).then(useCaseResult);
  }
}

export class ListSecurityProfilesUseCase {
  constructor(private readonly securityProfileRegistry: AiSecurityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListSecurityProfilesResult>> {
    return this.securityProfileRegistry.listSecurityProfiles().then(useCaseResult);
  }
}

export class UpdateSecurityProfileUseCase {
  constructor(private readonly securityProfileRegistry: AiSecurityProfileRegistryService) {}

  execute(input: UpdateSecurityProfileInput): Promise<UseCaseResult<SecurityProfile>> {
    return this.securityProfileRegistry.updateSecurityProfile(input).then(useCaseResult);
  }
}

export class DeleteSecurityProfileUseCase {
  constructor(private readonly securityProfileRegistry: AiSecurityProfileRegistryService) {}

  execute(securityProfileId: string): Promise<UseCaseResult<DeleteSecurityProfileResult>> {
    return this.securityProfileRegistry.deleteSecurityProfile(securityProfileId).then(useCaseResult);
  }
}

export class FindSecurityProfileByNameUseCase {
  constructor(private readonly securityProfileRegistry: AiSecurityProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindSecurityProfileByNameResult>> {
    return this.securityProfileRegistry.findSecurityProfileByName(name).then(useCaseResult);
  }
}

export class ListSecurityProfilesByCategoryUseCase {
  constructor(private readonly securityProfileRegistry: AiSecurityProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListSecurityProfilesByCategoryResult>> {
    return this.securityProfileRegistry.listSecurityProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetSecurityProfileRegistryStatisticsUseCase {
  constructor(private readonly securityProfileRegistry: AiSecurityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<SecurityProfileRegistryStatistics>> {
    return this.securityProfileRegistry.getSecurityProfileRegistryStatistics().then(useCaseResult);
  }
}
