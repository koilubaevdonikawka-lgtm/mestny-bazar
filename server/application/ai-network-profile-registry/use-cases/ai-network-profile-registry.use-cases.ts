import type {
  DeleteNetworkProfileResult,
  FindNetworkProfileByNameResult,
  NetworkProfile,
  NetworkProfileRegistryStatistics,
  ListNetworkProfilesByCategoryResult,
  ListNetworkProfilesResult,
  RegisterNetworkProfileInput,
  UpdateNetworkProfileInput,
} from "@server/application/ai-network-profile-registry/models/network-profile.model";
import type { AiNetworkProfileRegistryService } from "@server/application/ai-network-profile-registry/services/ai-network-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterNetworkProfileUseCase {
  constructor(private readonly networkProfileRegistry: AiNetworkProfileRegistryService) {}

  execute(input: RegisterNetworkProfileInput): Promise<UseCaseResult<NetworkProfile>> {
    return this.networkProfileRegistry.registerNetworkProfile(input).then(useCaseResult);
  }
}

export class GetNetworkProfileUseCase {
  constructor(private readonly networkProfileRegistry: AiNetworkProfileRegistryService) {}

  execute(networkProfileId: string): Promise<UseCaseResult<NetworkProfile | null>> {
    return this.networkProfileRegistry.getNetworkProfile(networkProfileId).then(useCaseResult);
  }
}

export class ListNetworkProfilesUseCase {
  constructor(private readonly networkProfileRegistry: AiNetworkProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListNetworkProfilesResult>> {
    return this.networkProfileRegistry.listNetworkProfiles().then(useCaseResult);
  }
}

export class UpdateNetworkProfileUseCase {
  constructor(private readonly networkProfileRegistry: AiNetworkProfileRegistryService) {}

  execute(input: UpdateNetworkProfileInput): Promise<UseCaseResult<NetworkProfile>> {
    return this.networkProfileRegistry.updateNetworkProfile(input).then(useCaseResult);
  }
}

export class DeleteNetworkProfileUseCase {
  constructor(private readonly networkProfileRegistry: AiNetworkProfileRegistryService) {}

  execute(networkProfileId: string): Promise<UseCaseResult<DeleteNetworkProfileResult>> {
    return this.networkProfileRegistry.deleteNetworkProfile(networkProfileId).then(useCaseResult);
  }
}

export class FindNetworkProfileByNameUseCase {
  constructor(private readonly networkProfileRegistry: AiNetworkProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindNetworkProfileByNameResult>> {
    return this.networkProfileRegistry.findNetworkProfileByName(name).then(useCaseResult);
  }
}

export class ListNetworkProfilesByCategoryUseCase {
  constructor(private readonly networkProfileRegistry: AiNetworkProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListNetworkProfilesByCategoryResult>> {
    return this.networkProfileRegistry.listNetworkProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetNetworkProfileRegistryStatisticsUseCase {
  constructor(private readonly networkProfileRegistry: AiNetworkProfileRegistryService) {}

  execute(): Promise<UseCaseResult<NetworkProfileRegistryStatistics>> {
    return this.networkProfileRegistry.getNetworkProfileRegistryStatistics().then(useCaseResult);
  }
}
