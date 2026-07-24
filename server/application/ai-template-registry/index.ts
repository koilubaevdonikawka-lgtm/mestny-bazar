export type { ITemplateRepository } from "./contracts/template-repository.contract";
export type { ITemplateCatalog } from "./contracts/template-catalog.contract";
export type {
  ITemplateValidator,
  TemplateValidationResult,
} from "./contracts/template-validator.contract";
export type { ITemplateSerializer } from "./contracts/template-serializer.contract";
export type { ITemplateStatisticsProvider } from "./contracts/template-statistics-provider.contract";
export type { IRemoteTemplateProvider } from "./contracts/remote-template-provider.contract";
export type { ITemplateImportProvider } from "./contracts/template-import-provider.contract";
export type { ITemplateExportProvider } from "./contracts/template-export-provider.contract";
export type { ITemplateVersionProvider } from "./contracts/template-version-provider.contract";
export type { ITemplateSynchronizationProvider } from "./contracts/template-synchronization-provider.contract";
export { createTemplate } from "./models/template.model";
export type {
  Template,
  RegisterTemplateInput,
  UpdateTemplateInput,
  ListTemplatesResult,
  FindTemplateByNameResult,
  ListTemplatesByCategoryResult,
  DeleteTemplateResult,
  TemplateRegistryStatistics,
} from "./models/template.model";
export { AiTemplateRegistryService } from "./services/ai-template-registry.service";
export { AiTemplateRegistryApplicationService } from "./services/ai-template-registry-application.service";
export {
  RegisterTemplateUseCase,
  GetTemplateUseCase,
  ListTemplatesUseCase,
  UpdateTemplateUseCase,
  DeleteTemplateUseCase,
  FindTemplateByNameUseCase,
  ListTemplatesByCategoryUseCase,
  GetTemplateRegistryStatisticsUseCase,
} from "./use-cases/ai-template-registry.use-cases";
