import type {
  DeleteResourcePoolResult,
  FindResourcePoolByNameResult,
  ListResourcePoolsByCategoryResult,
  ListResourcePoolsResult,
  RegisterResourcePoolInput,
  ResourcePool,
  ResourcePoolRegistryStatistics,
  UpdateResourcePoolInput,
} from "@server/application/ai-resource-pool-registry/models/resource-pool.model";
import type { AiResourcePoolRegistryService } from "@server/application/ai-resource-pool-registry/services/ai-resource-pool-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterResourcePoolUseCase {
  constructor(private readonly resourcePoolRegistry: AiResourcePoolRegistryService) {}

  execute(input: RegisterResourcePoolInput): Promise<UseCaseResult<ResourcePool>> {
    return this.resourcePoolRegistry.registerResourcePool(input).then(useCaseResult);
  }
}

export class GetResourcePoolUseCase {
  constructor(private readonly resourcePoolRegistry: AiResourcePoolRegistryService) {}

  execute(resourcePoolId: string): Promise<UseCaseResult<ResourcePool | null>> {
    return this.resourcePoolRegistry.getResourcePool(resourcePoolId).then(useCaseResult);
  }
}

export class ListResourcePoolsUseCase {
  constructor(private readonly resourcePoolRegistry: AiResourcePoolRegistryService) {}

  execute(): Promise<UseCaseResult<ListResourcePoolsResult>> {
    return this.resourcePoolRegistry.listResourcePools().then(useCaseResult);
  }
}

export class UpdateResourcePoolUseCase {
  constructor(private readonly resourcePoolRegistry: AiResourcePoolRegistryService) {}

  execute(input: UpdateResourcePoolInput): Promise<UseCaseResult<ResourcePool>> {
    return this.resourcePoolRegistry.updateResourcePool(input).then(useCaseResult);
  }
}

export class DeleteResourcePoolUseCase {
  constructor(private readonly resourcePoolRegistry: AiResourcePoolRegistryService) {}

  execute(resourcePoolId: string): Promise<UseCaseResult<DeleteResourcePoolResult>> {
    return this.resourcePoolRegistry.deleteResourcePool(resourcePoolId).then(useCaseResult);
  }
}

export class FindResourcePoolByNameUseCase {
  constructor(private readonly resourcePoolRegistry: AiResourcePoolRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindResourcePoolByNameResult>> {
    return this.resourcePoolRegistry.findResourcePoolByName(name).then(useCaseResult);
  }
}

export class ListResourcePoolsByCategoryUseCase {
  constructor(private readonly resourcePoolRegistry: AiResourcePoolRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListResourcePoolsByCategoryResult>> {
    return this.resourcePoolRegistry.listResourcePoolsByCategory(category).then(useCaseResult);
  }
}

export class GetResourcePoolRegistryStatisticsUseCase {
  constructor(private readonly resourcePoolRegistry: AiResourcePoolRegistryService) {}

  execute(): Promise<UseCaseResult<ResourcePoolRegistryStatistics>> {
    return this.resourcePoolRegistry.getResourcePoolRegistryStatistics().then(useCaseResult);
  }
}
