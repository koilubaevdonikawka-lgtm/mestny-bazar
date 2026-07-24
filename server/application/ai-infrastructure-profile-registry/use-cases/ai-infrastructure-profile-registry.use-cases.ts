import type {
  DeleteInfrastructureProfileResult,
  FindInfrastructureProfileByNameResult,
  InfrastructureProfile,
  InfrastructureProfileRegistryStatistics,
  ListInfrastructureProfilesByCategoryResult,
  ListInfrastructureProfilesResult,
  RegisterInfrastructureProfileInput,
  UpdateInfrastructureProfileInput,
} from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";
import type { AiInfrastructureProfileRegistryService } from "@server/application/ai-infrastructure-profile-registry/services/ai-infrastructure-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterInfrastructureProfileUseCase {
  constructor(private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryService) {}

  execute(input: RegisterInfrastructureProfileInput): Promise<UseCaseResult<InfrastructureProfile>> {
    return this.infrastructureProfileRegistry.registerInfrastructureProfile(input).then(useCaseResult);
  }
}

export class GetInfrastructureProfileUseCase {
  constructor(private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryService) {}

  execute(infrastructureProfileId: string): Promise<UseCaseResult<InfrastructureProfile | null>> {
    return this.infrastructureProfileRegistry.getInfrastructureProfile(infrastructureProfileId).then(useCaseResult);
  }
}

export class ListInfrastructureProfilesUseCase {
  constructor(private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListInfrastructureProfilesResult>> {
    return this.infrastructureProfileRegistry.listInfrastructureProfiles().then(useCaseResult);
  }
}

export class UpdateInfrastructureProfileUseCase {
  constructor(private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryService) {}

  execute(input: UpdateInfrastructureProfileInput): Promise<UseCaseResult<InfrastructureProfile>> {
    return this.infrastructureProfileRegistry.updateInfrastructureProfile(input).then(useCaseResult);
  }
}

export class DeleteInfrastructureProfileUseCase {
  constructor(private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryService) {}

  execute(infrastructureProfileId: string): Promise<UseCaseResult<DeleteInfrastructureProfileResult>> {
    return this.infrastructureProfileRegistry.deleteInfrastructureProfile(infrastructureProfileId).then(useCaseResult);
  }
}

export class FindInfrastructureProfileByNameUseCase {
  constructor(private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindInfrastructureProfileByNameResult>> {
    return this.infrastructureProfileRegistry.findInfrastructureProfileByName(name).then(useCaseResult);
  }
}

export class ListInfrastructureProfilesByCategoryUseCase {
  constructor(private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListInfrastructureProfilesByCategoryResult>> {
    return this.infrastructureProfileRegistry.listInfrastructureProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetInfrastructureProfileRegistryStatisticsUseCase {
  constructor(private readonly infrastructureProfileRegistry: AiInfrastructureProfileRegistryService) {}

  execute(): Promise<UseCaseResult<InfrastructureProfileRegistryStatistics>> {
    return this.infrastructureProfileRegistry.getInfrastructureProfileRegistryStatistics().then(useCaseResult);
  }
}
