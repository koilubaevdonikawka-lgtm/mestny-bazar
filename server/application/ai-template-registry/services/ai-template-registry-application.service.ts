import type {
  RegisterTemplateInput,
  UpdateTemplateInput,
} from "@server/application/ai-template-registry/models/template.model";
import {
  DeleteTemplateUseCase,
  FindTemplateByNameUseCase,
  GetTemplateRegistryStatisticsUseCase,
  GetTemplateUseCase,
  ListTemplatesByCategoryUseCase,
  ListTemplatesUseCase,
  RegisterTemplateUseCase,
  UpdateTemplateUseCase,
} from "@server/application/ai-template-registry/use-cases/ai-template-registry.use-cases";

/** Application facade for AI Template Registry scenario. */
export class AiTemplateRegistryApplicationService {
  constructor(
    private readonly registerTemplateUseCase: RegisterTemplateUseCase,
    private readonly getTemplateUseCase: GetTemplateUseCase,
    private readonly listTemplatesUseCase: ListTemplatesUseCase,
    private readonly updateTemplateUseCase: UpdateTemplateUseCase,
    private readonly deleteTemplateUseCase: DeleteTemplateUseCase,
    private readonly findTemplateByNameUseCase: FindTemplateByNameUseCase,
    private readonly listTemplatesByCategoryUseCase: ListTemplatesByCategoryUseCase,
    private readonly getTemplateRegistryStatisticsUseCase: GetTemplateRegistryStatisticsUseCase,
  ) {}

  registerTemplate(input: RegisterTemplateInput) {
    return this.registerTemplateUseCase.execute(input);
  }

  getTemplate(templateId: string) {
    return this.getTemplateUseCase.execute(templateId);
  }

  listTemplates() {
    return this.listTemplatesUseCase.execute();
  }

  updateTemplate(input: UpdateTemplateInput) {
    return this.updateTemplateUseCase.execute(input);
  }

  deleteTemplate(templateId: string) {
    return this.deleteTemplateUseCase.execute(templateId);
  }

  findTemplateByName(name: string) {
    return this.findTemplateByNameUseCase.execute(name);
  }

  listTemplatesByCategory(category: string) {
    return this.listTemplatesByCategoryUseCase.execute(category);
  }

  getTemplateRegistryStatistics() {
    return this.getTemplateRegistryStatisticsUseCase.execute();
  }
}
