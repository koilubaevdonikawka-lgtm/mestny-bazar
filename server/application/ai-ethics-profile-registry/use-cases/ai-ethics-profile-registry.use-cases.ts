import type {
  DeleteEthicsProfileResult,
  FindEthicsProfileByNameResult,
  EthicsProfile,
  EthicsProfileRegistryStatistics,
  ListEthicsProfilesByCategoryResult,
  ListEthicsProfilesResult,
  RegisterEthicsProfileInput,
  UpdateEthicsProfileInput,
} from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";
import type { AiEthicsProfileRegistryService } from "@server/application/ai-ethics-profile-registry/services/ai-ethics-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterEthicsProfileUseCase {
  constructor(private readonly ethicsProfileRegistry: AiEthicsProfileRegistryService) {}

  execute(input: RegisterEthicsProfileInput): Promise<UseCaseResult<EthicsProfile>> {
    return this.ethicsProfileRegistry.registerEthicsProfile(input).then(useCaseResult);
  }
}

export class GetEthicsProfileUseCase {
  constructor(private readonly ethicsProfileRegistry: AiEthicsProfileRegistryService) {}

  execute(ethicsProfileId: string): Promise<UseCaseResult<EthicsProfile | null>> {
    return this.ethicsProfileRegistry.getEthicsProfile(ethicsProfileId).then(useCaseResult);
  }
}

export class ListEthicsProfilesUseCase {
  constructor(private readonly ethicsProfileRegistry: AiEthicsProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListEthicsProfilesResult>> {
    return this.ethicsProfileRegistry.listEthicsProfiles().then(useCaseResult);
  }
}

export class UpdateEthicsProfileUseCase {
  constructor(private readonly ethicsProfileRegistry: AiEthicsProfileRegistryService) {}

  execute(input: UpdateEthicsProfileInput): Promise<UseCaseResult<EthicsProfile>> {
    return this.ethicsProfileRegistry.updateEthicsProfile(input).then(useCaseResult);
  }
}

export class DeleteEthicsProfileUseCase {
  constructor(private readonly ethicsProfileRegistry: AiEthicsProfileRegistryService) {}

  execute(ethicsProfileId: string): Promise<UseCaseResult<DeleteEthicsProfileResult>> {
    return this.ethicsProfileRegistry.deleteEthicsProfile(ethicsProfileId).then(useCaseResult);
  }
}

export class FindEthicsProfileByNameUseCase {
  constructor(private readonly ethicsProfileRegistry: AiEthicsProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindEthicsProfileByNameResult>> {
    return this.ethicsProfileRegistry.findEthicsProfileByName(name).then(useCaseResult);
  }
}

export class ListEthicsProfilesByCategoryUseCase {
  constructor(private readonly ethicsProfileRegistry: AiEthicsProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListEthicsProfilesByCategoryResult>> {
    return this.ethicsProfileRegistry.listEthicsProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetEthicsProfileRegistryStatisticsUseCase {
  constructor(private readonly ethicsProfileRegistry: AiEthicsProfileRegistryService) {}

  execute(): Promise<UseCaseResult<EthicsProfileRegistryStatistics>> {
    return this.ethicsProfileRegistry.getEthicsProfileRegistryStatistics().then(useCaseResult);
  }
}
