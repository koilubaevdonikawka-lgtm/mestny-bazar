export type { IOntologyRepository } from "./contracts/ontology-repository.contract";
export type { IOntologyCatalog } from "./contracts/ontology-catalog.contract";
export type {
  IOntologyValidator,
  OntologyValidationResult,
} from "./contracts/ontology-validator.contract";
export type { IOntologySerializer } from "./contracts/ontology-serializer.contract";
export type { IOntologyStatisticsProvider } from "./contracts/ontology-statistics-provider.contract";
export type { IRemoteOntologyProvider } from "./contracts/remote-ontology-provider.contract";
export type { IOntologyImportProvider } from "./contracts/ontology-import-provider.contract";
export type { IOntologyExportProvider } from "./contracts/ontology-export-provider.contract";
export type { IOntologySynchronizationProvider } from "./contracts/ontology-synchronization-provider.contract";
export { createOntology } from "./models/ontology.model";
export type {
  Ontology,
  RegisterOntologyInput,
  UpdateOntologyInput,
  ListOntologiesResult,
  FindOntologyByNameResult,
  ListOntologiesByCategoryResult,
  DeleteOntologyResult,
  OntologyRegistryStatistics,
} from "./models/ontology.model";
export { AiOntologyRegistryService } from "./services/ai-ontology-registry.service";
export { AiOntologyRegistryApplicationService } from "./services/ai-ontology-registry-application.service";
export {
  RegisterOntologyUseCase,
  GetOntologyUseCase,
  ListOntologiesUseCase,
  UpdateOntologyUseCase,
  DeleteOntologyUseCase,
  FindOntologyByNameUseCase,
  ListOntologiesByCategoryUseCase,
  GetOntologyRegistryStatisticsUseCase,
} from "./use-cases/ai-ontology-registry.use-cases";
