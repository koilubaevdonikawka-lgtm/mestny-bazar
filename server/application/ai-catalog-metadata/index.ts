export type { ICatalogMetadataRepository } from "./contracts/catalog-metadata-repository.contract";
export type { ICatalogMetadataCatalog } from "./contracts/catalog-metadata-catalog.contract";
export type {
  ICatalogMetadataValidator,
  CatalogMetadataValidationResult,
} from "./contracts/catalog-metadata-validator.contract";
export type { ICatalogMetadataSerializer } from "./contracts/catalog-metadata-serializer.contract";
export type { ICatalogMetadataStatisticsProvider } from "./contracts/catalog-metadata-statistics-provider.contract";
export type { IVectorMetadataProvider } from "./contracts/vector-metadata-provider.contract";
export type { IOntologyMetadataProvider } from "./contracts/ontology-metadata-provider.contract";
export type { ISchemaMetadataProvider } from "./contracts/schema-metadata-provider.contract";
export type { IRemoteMetadataProvider } from "./contracts/remote-metadata-provider.contract";
export type { IMetadataSynchronizationProvider } from "./contracts/metadata-synchronization-provider.contract";
export { createCatalogMetadata } from "./models/catalog-metadata.model";
export type {
  CatalogMetadata,
  RegisterCatalogMetadataInput,
  UpdateCatalogMetadataInput,
  ListCatalogMetadataResult,
  FindCatalogMetadataByNameResult,
  ListCatalogMetadataByCategoryResult,
  DeleteCatalogMetadataResult,
  CatalogMetadataStatistics,
} from "./models/catalog-metadata.model";
export { AiCatalogMetadataService } from "./services/ai-catalog-metadata.service";
export { AiCatalogMetadataApplicationService } from "./services/ai-catalog-metadata-application.service";
export {
  RegisterCatalogMetadataUseCase,
  GetCatalogMetadataUseCase,
  ListCatalogMetadataUseCase,
  UpdateCatalogMetadataUseCase,
  DeleteCatalogMetadataUseCase,
  FindCatalogMetadataByNameUseCase,
  ListCatalogMetadataByCategoryUseCase,
  GetCatalogMetadataStatisticsUseCase,
} from "./use-cases/ai-catalog-metadata.use-cases";
