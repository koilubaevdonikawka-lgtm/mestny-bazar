import type {
  DeleteNodeProfileResult,
  FindNodeProfileByNameResult,
  NodeProfile,
  NodeProfileRegistryStatistics,
  ListNodeProfilesByCategoryResult,
  ListNodeProfilesResult,
  RegisterNodeProfileInput,
  UpdateNodeProfileInput,
} from "@server/application/ai-node-profile-registry/models/node-profile.model";
import type { AiNodeProfileRegistryService } from "@server/application/ai-node-profile-registry/services/ai-node-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterNodeProfileUseCase {
  constructor(private readonly nodeProfileRegistry: AiNodeProfileRegistryService) {}

  execute(input: RegisterNodeProfileInput): Promise<UseCaseResult<NodeProfile>> {
    return this.nodeProfileRegistry.registerNodeProfile(input).then(useCaseResult);
  }
}

export class GetNodeProfileUseCase {
  constructor(private readonly nodeProfileRegistry: AiNodeProfileRegistryService) {}

  execute(nodeProfileId: string): Promise<UseCaseResult<NodeProfile | null>> {
    return this.nodeProfileRegistry.getNodeProfile(nodeProfileId).then(useCaseResult);
  }
}

export class ListNodeProfilesUseCase {
  constructor(private readonly nodeProfileRegistry: AiNodeProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListNodeProfilesResult>> {
    return this.nodeProfileRegistry.listNodeProfiles().then(useCaseResult);
  }
}

export class UpdateNodeProfileUseCase {
  constructor(private readonly nodeProfileRegistry: AiNodeProfileRegistryService) {}

  execute(input: UpdateNodeProfileInput): Promise<UseCaseResult<NodeProfile>> {
    return this.nodeProfileRegistry.updateNodeProfile(input).then(useCaseResult);
  }
}

export class DeleteNodeProfileUseCase {
  constructor(private readonly nodeProfileRegistry: AiNodeProfileRegistryService) {}

  execute(nodeProfileId: string): Promise<UseCaseResult<DeleteNodeProfileResult>> {
    return this.nodeProfileRegistry.deleteNodeProfile(nodeProfileId).then(useCaseResult);
  }
}

export class FindNodeProfileByNameUseCase {
  constructor(private readonly nodeProfileRegistry: AiNodeProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindNodeProfileByNameResult>> {
    return this.nodeProfileRegistry.findNodeProfileByName(name).then(useCaseResult);
  }
}

export class ListNodeProfilesByCategoryUseCase {
  constructor(private readonly nodeProfileRegistry: AiNodeProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListNodeProfilesByCategoryResult>> {
    return this.nodeProfileRegistry.listNodeProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetNodeProfileRegistryStatisticsUseCase {
  constructor(private readonly nodeProfileRegistry: AiNodeProfileRegistryService) {}

  execute(): Promise<UseCaseResult<NodeProfileRegistryStatistics>> {
    return this.nodeProfileRegistry.getNodeProfileRegistryStatistics().then(useCaseResult);
  }
}
