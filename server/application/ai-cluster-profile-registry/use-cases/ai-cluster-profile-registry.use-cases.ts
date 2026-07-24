import type {
  DeleteClusterProfileResult,
  FindClusterProfileByNameResult,
  ClusterProfile,
  ClusterProfileRegistryStatistics,
  ListClusterProfilesByCategoryResult,
  ListClusterProfilesResult,
  RegisterClusterProfileInput,
  UpdateClusterProfileInput,
} from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";
import type { AiClusterProfileRegistryService } from "@server/application/ai-cluster-profile-registry/services/ai-cluster-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterClusterProfileUseCase {
  constructor(private readonly clusterProfileRegistry: AiClusterProfileRegistryService) {}

  execute(input: RegisterClusterProfileInput): Promise<UseCaseResult<ClusterProfile>> {
    return this.clusterProfileRegistry.registerClusterProfile(input).then(useCaseResult);
  }
}

export class GetClusterProfileUseCase {
  constructor(private readonly clusterProfileRegistry: AiClusterProfileRegistryService) {}

  execute(clusterProfileId: string): Promise<UseCaseResult<ClusterProfile | null>> {
    return this.clusterProfileRegistry.getClusterProfile(clusterProfileId).then(useCaseResult);
  }
}

export class ListClusterProfilesUseCase {
  constructor(private readonly clusterProfileRegistry: AiClusterProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListClusterProfilesResult>> {
    return this.clusterProfileRegistry.listClusterProfiles().then(useCaseResult);
  }
}

export class UpdateClusterProfileUseCase {
  constructor(private readonly clusterProfileRegistry: AiClusterProfileRegistryService) {}

  execute(input: UpdateClusterProfileInput): Promise<UseCaseResult<ClusterProfile>> {
    return this.clusterProfileRegistry.updateClusterProfile(input).then(useCaseResult);
  }
}

export class DeleteClusterProfileUseCase {
  constructor(private readonly clusterProfileRegistry: AiClusterProfileRegistryService) {}

  execute(clusterProfileId: string): Promise<UseCaseResult<DeleteClusterProfileResult>> {
    return this.clusterProfileRegistry.deleteClusterProfile(clusterProfileId).then(useCaseResult);
  }
}

export class FindClusterProfileByNameUseCase {
  constructor(private readonly clusterProfileRegistry: AiClusterProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindClusterProfileByNameResult>> {
    return this.clusterProfileRegistry.findClusterProfileByName(name).then(useCaseResult);
  }
}

export class ListClusterProfilesByCategoryUseCase {
  constructor(private readonly clusterProfileRegistry: AiClusterProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListClusterProfilesByCategoryResult>> {
    return this.clusterProfileRegistry.listClusterProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetClusterProfileRegistryStatisticsUseCase {
  constructor(private readonly clusterProfileRegistry: AiClusterProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ClusterProfileRegistryStatistics>> {
    return this.clusterProfileRegistry.getClusterProfileRegistryStatistics().then(useCaseResult);
  }
}
