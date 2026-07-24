import type {
  DeleteComplianceProfileResult,
  FindComplianceProfileByNameResult,
  ComplianceProfile,
  ComplianceProfileRegistryStatistics,
  ListComplianceProfilesByCategoryResult,
  ListComplianceProfilesResult,
  RegisterComplianceProfileInput,
  UpdateComplianceProfileInput,
} from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";
import type { AiComplianceProfileRegistryService } from "@server/application/ai-compliance-profile-registry/services/ai-compliance-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterComplianceProfileUseCase {
  constructor(private readonly complianceProfileRegistry: AiComplianceProfileRegistryService) {}

  execute(input: RegisterComplianceProfileInput): Promise<UseCaseResult<ComplianceProfile>> {
    return this.complianceProfileRegistry.registerComplianceProfile(input).then(useCaseResult);
  }
}

export class GetComplianceProfileUseCase {
  constructor(private readonly complianceProfileRegistry: AiComplianceProfileRegistryService) {}

  execute(complianceProfileId: string): Promise<UseCaseResult<ComplianceProfile | null>> {
    return this.complianceProfileRegistry.getComplianceProfile(complianceProfileId).then(useCaseResult);
  }
}

export class ListComplianceProfilesUseCase {
  constructor(private readonly complianceProfileRegistry: AiComplianceProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListComplianceProfilesResult>> {
    return this.complianceProfileRegistry.listComplianceProfiles().then(useCaseResult);
  }
}

export class UpdateComplianceProfileUseCase {
  constructor(private readonly complianceProfileRegistry: AiComplianceProfileRegistryService) {}

  execute(input: UpdateComplianceProfileInput): Promise<UseCaseResult<ComplianceProfile>> {
    return this.complianceProfileRegistry.updateComplianceProfile(input).then(useCaseResult);
  }
}

export class DeleteComplianceProfileUseCase {
  constructor(private readonly complianceProfileRegistry: AiComplianceProfileRegistryService) {}

  execute(complianceProfileId: string): Promise<UseCaseResult<DeleteComplianceProfileResult>> {
    return this.complianceProfileRegistry.deleteComplianceProfile(complianceProfileId).then(useCaseResult);
  }
}

export class FindComplianceProfileByNameUseCase {
  constructor(private readonly complianceProfileRegistry: AiComplianceProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindComplianceProfileByNameResult>> {
    return this.complianceProfileRegistry.findComplianceProfileByName(name).then(useCaseResult);
  }
}

export class ListComplianceProfilesByCategoryUseCase {
  constructor(private readonly complianceProfileRegistry: AiComplianceProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListComplianceProfilesByCategoryResult>> {
    return this.complianceProfileRegistry.listComplianceProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetComplianceProfileRegistryStatisticsUseCase {
  constructor(private readonly complianceProfileRegistry: AiComplianceProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ComplianceProfileRegistryStatistics>> {
    return this.complianceProfileRegistry.getComplianceProfileRegistryStatistics().then(useCaseResult);
  }
}
