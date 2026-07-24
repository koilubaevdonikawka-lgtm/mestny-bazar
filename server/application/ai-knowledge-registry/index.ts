export type { IKnowledgeSourceRepository } from "./contracts/knowledge-source-repository.contract";
export type { IKnowledgeCatalog } from "./contracts/knowledge-catalog.contract";
export type {
  IKnowledgeValidator,
  KnowledgeValidationResult,
} from "./contracts/knowledge-validator.contract";
export type { IKnowledgeSerializer } from "./contracts/knowledge-serializer.contract";
export type { IKnowledgeStatisticsProvider } from "./contracts/knowledge-statistics-provider.contract";
export { createKnowledgeSource } from "./models/knowledge-source.model";
export type {
  KnowledgeSource,
  RegisterKnowledgeSourceInput,
  UpdateKnowledgeSourceInput,
  ListKnowledgeSourcesResult,
  FindKnowledgeSourceByNameResult,
  ListKnowledgeSourcesByCategoryResult,
  DeleteKnowledgeSourceResult,
  KnowledgeRegistryStatistics,
} from "./models/knowledge-source.model";
export { AiKnowledgeRegistryService } from "./services/ai-knowledge-registry.service";
export { AiKnowledgeRegistryApplicationService } from "./services/ai-knowledge-registry-application.service";
export {
  RegisterKnowledgeSourceUseCase,
  GetKnowledgeSourceUseCase,
  ListKnowledgeSourcesUseCase,
  UpdateKnowledgeSourceUseCase,
  DeleteKnowledgeSourceUseCase,
  FindKnowledgeSourceByNameUseCase,
  ListKnowledgeSourcesByCategoryUseCase,
  GetKnowledgeRegistryStatisticsUseCase,
} from "./use-cases/ai-knowledge-registry.use-cases";
