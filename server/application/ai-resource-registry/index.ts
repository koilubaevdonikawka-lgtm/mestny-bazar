export type { IResourceRepository } from "./contracts/resource-repository.contract";
export type { IResourceCatalog } from "./contracts/resource-catalog.contract";
export type {
  IResourceValidator,
  ResourceValidationResult,
} from "./contracts/resource-validator.contract";
export type { IResourceSerializer } from "./contracts/resource-serializer.contract";
export type { IResourceStatisticsProvider } from "./contracts/resource-statistics-provider.contract";
export type { IRemoteResourceProvider } from "./contracts/remote-resource-provider.contract";
export type { IResourceImportProvider } from "./contracts/resource-import-provider.contract";
export type { IResourceExportProvider } from "./contracts/resource-export-provider.contract";
export type { IResourceSynchronizationProvider } from "./contracts/resource-synchronization-provider.contract";
export type { IResourceMetadataProvider } from "./contracts/resource-metadata-provider.contract";
export { createResource } from "./models/resource.model";
export type {
  Resource,
  RegisterResourceInput,
  UpdateResourceInput,
  ListResourcesResult,
  FindResourceByNameResult,
  ListResourcesByTypeResult,
  DeleteResourceResult,
  ResourceRegistryStatistics,
} from "./models/resource.model";
export { AiResourceRegistryService } from "./services/ai-resource-registry.service";
export { AiResourceRegistryApplicationService } from "./services/ai-resource-registry-application.service";
export {
  RegisterResourceUseCase,
  GetResourceUseCase,
  ListResourcesUseCase,
  UpdateResourceUseCase,
  DeleteResourceUseCase,
  FindResourceByNameUseCase,
  ListResourcesByTypeUseCase,
  GetResourceRegistryStatisticsUseCase,
} from "./use-cases/ai-resource-registry.use-cases";
