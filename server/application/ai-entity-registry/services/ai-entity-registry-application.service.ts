import type {
  RegisterEntityInput,
  UpdateEntityInput,
} from "@server/application/ai-entity-registry/models/entity.model";
import {
  DeleteEntityUseCase,
  FindEntityByNameUseCase,
  GetEntityRegistryStatisticsUseCase,
  GetEntityUseCase,
  ListEntitiesByCategoryUseCase,
  ListEntitiesUseCase,
  RegisterEntityUseCase,
  UpdateEntityUseCase,
} from "@server/application/ai-entity-registry/use-cases/ai-entity-registry.use-cases";

/** Application facade for AI Entity Registry scenario. */
export class AiEntityRegistryApplicationService {
  constructor(
    private readonly registerEntityUseCase: RegisterEntityUseCase,
    private readonly getEntityUseCase: GetEntityUseCase,
    private readonly listEntitiesUseCase: ListEntitiesUseCase,
    private readonly updateEntityUseCase: UpdateEntityUseCase,
    private readonly deleteEntityUseCase: DeleteEntityUseCase,
    private readonly findEntityByNameUseCase: FindEntityByNameUseCase,
    private readonly listEntitiesByCategoryUseCase: ListEntitiesByCategoryUseCase,
    private readonly getEntityRegistryStatisticsUseCase: GetEntityRegistryStatisticsUseCase,
  ) {}

  registerEntity(input: RegisterEntityInput) {
    return this.registerEntityUseCase.execute(input);
  }

  getEntity(entityId: string) {
    return this.getEntityUseCase.execute(entityId);
  }

  listEntities() {
    return this.listEntitiesUseCase.execute();
  }

  updateEntity(input: UpdateEntityInput) {
    return this.updateEntityUseCase.execute(input);
  }

  deleteEntity(entityId: string) {
    return this.deleteEntityUseCase.execute(entityId);
  }

  findEntityByName(name: string) {
    return this.findEntityByNameUseCase.execute(name);
  }

  listEntitiesByCategory(category: string) {
    return this.listEntitiesByCategoryUseCase.execute(category);
  }

  getEntityRegistryStatistics() {
    return this.getEntityRegistryStatisticsUseCase.execute();
  }
}
