export type { IEntityRepository } from "./contracts/entity-repository.contract";
export type { IEntityCatalog } from "./contracts/entity-catalog.contract";
export type {
  IEntityValidator,
  EntityValidationResult,
} from "./contracts/entity-validator.contract";
export type { IEntitySerializer } from "./contracts/entity-serializer.contract";
export type { IEntityStatisticsProvider } from "./contracts/entity-statistics-provider.contract";
export type { IRemoteEntityProvider } from "./contracts/remote-entity-provider.contract";
export type { IEntityImportProvider } from "./contracts/entity-import-provider.contract";
export type { IEntityExportProvider } from "./contracts/entity-export-provider.contract";
export type { IEntitySynchronizationProvider } from "./contracts/entity-synchronization-provider.contract";
export { createEntity } from "./models/entity.model";
export type {
  Entity,
  RegisterEntityInput,
  UpdateEntityInput,
  ListEntitiesResult,
  FindEntityByNameResult,
  ListEntitiesByCategoryResult,
  DeleteEntityResult,
  EntityRegistryStatistics,
} from "./models/entity.model";
export { AiEntityRegistryService } from "./services/ai-entity-registry.service";
export { AiEntityRegistryApplicationService } from "./services/ai-entity-registry-application.service";
export {
  RegisterEntityUseCase,
  GetEntityUseCase,
  ListEntitiesUseCase,
  UpdateEntityUseCase,
  DeleteEntityUseCase,
  FindEntityByNameUseCase,
  ListEntitiesByCategoryUseCase,
  GetEntityRegistryStatisticsUseCase,
} from "./use-cases/ai-entity-registry.use-cases";
