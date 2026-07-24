import type {
  DeleteResourceResult,
  FindResourceByNameResult,
  ListResourcesByTypeResult,
  ListResourcesResult,
  RegisterResourceInput,
  Resource,
  ResourceRegistryStatistics,
  UpdateResourceInput,
} from "@server/application/ai-resource-registry/models/resource.model";
import type { AiResourceRegistryService } from "@server/application/ai-resource-registry/services/ai-resource-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterResourceUseCase {
  constructor(private readonly resourceRegistry: AiResourceRegistryService) {}

  execute(input: RegisterResourceInput): Promise<UseCaseResult<Resource>> {
    return this.resourceRegistry.registerResource(input).then(useCaseResult);
  }
}

export class GetResourceUseCase {
  constructor(private readonly resourceRegistry: AiResourceRegistryService) {}

  execute(resourceId: string): Promise<UseCaseResult<Resource | null>> {
    return this.resourceRegistry.getResource(resourceId).then(useCaseResult);
  }
}

export class ListResourcesUseCase {
  constructor(private readonly resourceRegistry: AiResourceRegistryService) {}

  execute(): Promise<UseCaseResult<ListResourcesResult>> {
    return this.resourceRegistry.listResources().then(useCaseResult);
  }
}

export class UpdateResourceUseCase {
  constructor(private readonly resourceRegistry: AiResourceRegistryService) {}

  execute(input: UpdateResourceInput): Promise<UseCaseResult<Resource>> {
    return this.resourceRegistry.updateResource(input).then(useCaseResult);
  }
}

export class DeleteResourceUseCase {
  constructor(private readonly resourceRegistry: AiResourceRegistryService) {}

  execute(resourceId: string): Promise<UseCaseResult<DeleteResourceResult>> {
    return this.resourceRegistry.deleteResource(resourceId).then(useCaseResult);
  }
}

export class FindResourceByNameUseCase {
  constructor(private readonly resourceRegistry: AiResourceRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindResourceByNameResult>> {
    return this.resourceRegistry.findResourceByName(name).then(useCaseResult);
  }
}

export class ListResourcesByTypeUseCase {
  constructor(private readonly resourceRegistry: AiResourceRegistryService) {}

  execute(type: string): Promise<UseCaseResult<ListResourcesByTypeResult>> {
    return this.resourceRegistry.listResourcesByType(type).then(useCaseResult);
  }
}

export class GetResourceRegistryStatisticsUseCase {
  constructor(private readonly resourceRegistry: AiResourceRegistryService) {}

  execute(): Promise<UseCaseResult<ResourceRegistryStatistics>> {
    return this.resourceRegistry.getResourceRegistryStatistics().then(useCaseResult);
  }
}
