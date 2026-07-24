export type { IRelationRepository } from "./contracts/relation-repository.contract";
export type { IRelationCatalog } from "./contracts/relation-catalog.contract";
export type {
  IRelationValidator,
  RelationValidationResult,
} from "./contracts/relation-validator.contract";
export type { IRelationSerializer } from "./contracts/relation-serializer.contract";
export type { IRelationStatisticsProvider } from "./contracts/relation-statistics-provider.contract";
export type { IRemoteRelationProvider } from "./contracts/remote-relation-provider.contract";
export type { IRelationImportProvider } from "./contracts/relation-import-provider.contract";
export type { IRelationExportProvider } from "./contracts/relation-export-provider.contract";
export type { IRelationSynchronizationProvider } from "./contracts/relation-synchronization-provider.contract";
export { createRelation } from "./models/relation.model";
export type {
  Relation,
  RegisterRelationInput,
  UpdateRelationInput,
  ListRelationsResult,
  FindRelationByNameResult,
  ListRelationsByCategoryResult,
  DeleteRelationResult,
  RelationRegistryStatistics,
} from "./models/relation.model";
export { AiRelationRegistryService } from "./services/ai-relation-registry.service";
export { AiRelationRegistryApplicationService } from "./services/ai-relation-registry-application.service";
export {
  RegisterRelationUseCase,
  GetRelationUseCase,
  ListRelationsUseCase,
  UpdateRelationUseCase,
  DeleteRelationUseCase,
  FindRelationByNameUseCase,
  ListRelationsByCategoryUseCase,
  GetRelationRegistryStatisticsUseCase,
} from "./use-cases/ai-relation-registry.use-cases";
