export type { IVocabularyRepository } from "./contracts/vocabulary-repository.contract";
export type { IVocabularyCatalog } from "./contracts/vocabulary-catalog.contract";
export type {
  IVocabularyValidator,
  VocabularyValidationResult,
} from "./contracts/vocabulary-validator.contract";
export type { IVocabularySerializer } from "./contracts/vocabulary-serializer.contract";
export type { IVocabularyStatisticsProvider } from "./contracts/vocabulary-statistics-provider.contract";
export type { IRemoteVocabularyProvider } from "./contracts/remote-vocabulary-provider.contract";
export type { IVocabularyImportProvider } from "./contracts/vocabulary-import-provider.contract";
export type { IVocabularyExportProvider } from "./contracts/vocabulary-export-provider.contract";
export type { IVocabularySynchronizationProvider } from "./contracts/vocabulary-synchronization-provider.contract";
export { createVocabulary } from "./models/vocabulary.model";
export type {
  Vocabulary,
  RegisterVocabularyInput,
  UpdateVocabularyInput,
  ListVocabulariesResult,
  FindVocabularyByNameResult,
  ListVocabulariesByCategoryResult,
  DeleteVocabularyResult,
  VocabularyRegistryStatistics,
} from "./models/vocabulary.model";
export { AiVocabularyRegistryService } from "./services/ai-vocabulary-registry.service";
export { AiVocabularyRegistryApplicationService } from "./services/ai-vocabulary-registry-application.service";
export {
  RegisterVocabularyUseCase,
  GetVocabularyUseCase,
  ListVocabulariesUseCase,
  UpdateVocabularyUseCase,
  DeleteVocabularyUseCase,
  FindVocabularyByNameUseCase,
  ListVocabulariesByCategoryUseCase,
  GetVocabularyRegistryStatisticsUseCase,
} from "./use-cases/ai-vocabulary-registry.use-cases";
