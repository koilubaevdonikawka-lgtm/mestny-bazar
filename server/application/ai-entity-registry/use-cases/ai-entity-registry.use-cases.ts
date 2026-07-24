import type {
  DeleteEntityResult,
  FindEntityByNameResult,
  ListEntitiesByCategoryResult,
  ListEntitiesResult,
  RegisterEntityInput,
  Entity,
  EntityRegistryStatistics,
  UpdateEntityInput,
} from "@server/application/ai-entity-registry/models/entity.model";
import type { AiEntityRegistryService } from "@server/application/ai-entity-registry/services/ai-entity-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterEntityUseCase {
  constructor(private readonly entityRegistry: AiEntityRegistryService) {}

  execute(input: RegisterEntityInput): Promise<UseCaseResult<Entity>> {
    return this.entityRegistry.registerEntity(input).then(useCaseResult);
  }
}

export class GetEntityUseCase {
  constructor(private readonly entityRegistry: AiEntityRegistryService) {}

  execute(entityId: string): Promise<UseCaseResult<Entity | null>> {
    return this.entityRegistry.getEntity(entityId).then(useCaseResult);
  }
}

export class ListEntitiesUseCase {
  constructor(private readonly entityRegistry: AiEntityRegistryService) {}

  execute(): Promise<UseCaseResult<ListEntitiesResult>> {
    return this.entityRegistry.listEntities().then(useCaseResult);
  }
}

export class UpdateEntityUseCase {
  constructor(private readonly entityRegistry: AiEntityRegistryService) {}

  execute(input: UpdateEntityInput): Promise<UseCaseResult<Entity>> {
    return this.entityRegistry.updateEntity(input).then(useCaseResult);
  }
}

export class DeleteEntityUseCase {
  constructor(private readonly entityRegistry: AiEntityRegistryService) {}

  execute(entityId: string): Promise<UseCaseResult<DeleteEntityResult>> {
    return this.entityRegistry.deleteEntity(entityId).then(useCaseResult);
  }
}

export class FindEntityByNameUseCase {
  constructor(private readonly entityRegistry: AiEntityRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindEntityByNameResult>> {
    return this.entityRegistry.findEntityByName(name).then(useCaseResult);
  }
}

export class ListEntitiesByCategoryUseCase {
  constructor(private readonly entityRegistry: AiEntityRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListEntitiesByCategoryResult>> {
    return this.entityRegistry.listEntitiesByCategory(category).then(useCaseResult);
  }
}

export class GetEntityRegistryStatisticsUseCase {
  constructor(private readonly entityRegistry: AiEntityRegistryService) {}

  execute(): Promise<UseCaseResult<EntityRegistryStatistics>> {
    return this.entityRegistry.getEntityRegistryStatistics().then(useCaseResult);
  }
}
