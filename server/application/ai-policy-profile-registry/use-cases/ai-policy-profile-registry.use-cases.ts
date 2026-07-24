import type {
  DeletePolicyProfileResult,
  FindPolicyProfileByNameResult,
  PolicyProfile,
  PolicyProfileRegistryStatistics,
  ListPolicyProfilesByCategoryResult,
  ListPolicyProfilesResult,
  RegisterPolicyProfileInput,
  UpdatePolicyProfileInput,
} from "@server/application/ai-policy-profile-registry/models/policy-profile.model";
import type { AiPolicyProfileRegistryService } from "@server/application/ai-policy-profile-registry/services/ai-policy-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterPolicyProfileUseCase {
  constructor(private readonly policyProfileRegistry: AiPolicyProfileRegistryService) {}

  execute(input: RegisterPolicyProfileInput): Promise<UseCaseResult<PolicyProfile>> {
    return this.policyProfileRegistry.registerPolicyProfile(input).then(useCaseResult);
  }
}

export class GetPolicyProfileUseCase {
  constructor(private readonly policyProfileRegistry: AiPolicyProfileRegistryService) {}

  execute(policyProfileId: string): Promise<UseCaseResult<PolicyProfile | null>> {
    return this.policyProfileRegistry.getPolicyProfile(policyProfileId).then(useCaseResult);
  }
}

export class ListPolicyProfilesUseCase {
  constructor(private readonly policyProfileRegistry: AiPolicyProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListPolicyProfilesResult>> {
    return this.policyProfileRegistry.listPolicyProfiles().then(useCaseResult);
  }
}

export class UpdatePolicyProfileUseCase {
  constructor(private readonly policyProfileRegistry: AiPolicyProfileRegistryService) {}

  execute(input: UpdatePolicyProfileInput): Promise<UseCaseResult<PolicyProfile>> {
    return this.policyProfileRegistry.updatePolicyProfile(input).then(useCaseResult);
  }
}

export class DeletePolicyProfileUseCase {
  constructor(private readonly policyProfileRegistry: AiPolicyProfileRegistryService) {}

  execute(policyProfileId: string): Promise<UseCaseResult<DeletePolicyProfileResult>> {
    return this.policyProfileRegistry.deletePolicyProfile(policyProfileId).then(useCaseResult);
  }
}

export class FindPolicyProfileByNameUseCase {
  constructor(private readonly policyProfileRegistry: AiPolicyProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindPolicyProfileByNameResult>> {
    return this.policyProfileRegistry.findPolicyProfileByName(name).then(useCaseResult);
  }
}

export class ListPolicyProfilesByCategoryUseCase {
  constructor(private readonly policyProfileRegistry: AiPolicyProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListPolicyProfilesByCategoryResult>> {
    return this.policyProfileRegistry.listPolicyProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetPolicyProfileRegistryStatisticsUseCase {
  constructor(private readonly policyProfileRegistry: AiPolicyProfileRegistryService) {}

  execute(): Promise<UseCaseResult<PolicyProfileRegistryStatistics>> {
    return this.policyProfileRegistry.getPolicyProfileRegistryStatistics().then(useCaseResult);
  }
}
