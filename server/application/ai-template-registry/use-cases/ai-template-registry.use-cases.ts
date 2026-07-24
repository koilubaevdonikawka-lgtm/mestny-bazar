import type {
  DeleteTemplateResult,
  FindTemplateByNameResult,
  ListTemplatesByCategoryResult,
  ListTemplatesResult,
  RegisterTemplateInput,
  Template,
  TemplateRegistryStatistics,
  UpdateTemplateInput,
} from "@server/application/ai-template-registry/models/template.model";
import type { AiTemplateRegistryService } from "@server/application/ai-template-registry/services/ai-template-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterTemplateUseCase {
  constructor(private readonly templateRegistry: AiTemplateRegistryService) {}

  execute(input: RegisterTemplateInput): Promise<UseCaseResult<Template>> {
    return this.templateRegistry.registerTemplate(input).then(useCaseResult);
  }
}

export class GetTemplateUseCase {
  constructor(private readonly templateRegistry: AiTemplateRegistryService) {}

  execute(templateId: string): Promise<UseCaseResult<Template | null>> {
    return this.templateRegistry.getTemplate(templateId).then(useCaseResult);
  }
}

export class ListTemplatesUseCase {
  constructor(private readonly templateRegistry: AiTemplateRegistryService) {}

  execute(): Promise<UseCaseResult<ListTemplatesResult>> {
    return this.templateRegistry.listTemplates().then(useCaseResult);
  }
}

export class UpdateTemplateUseCase {
  constructor(private readonly templateRegistry: AiTemplateRegistryService) {}

  execute(input: UpdateTemplateInput): Promise<UseCaseResult<Template>> {
    return this.templateRegistry.updateTemplate(input).then(useCaseResult);
  }
}

export class DeleteTemplateUseCase {
  constructor(private readonly templateRegistry: AiTemplateRegistryService) {}

  execute(templateId: string): Promise<UseCaseResult<DeleteTemplateResult>> {
    return this.templateRegistry.deleteTemplate(templateId).then(useCaseResult);
  }
}

export class FindTemplateByNameUseCase {
  constructor(private readonly templateRegistry: AiTemplateRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindTemplateByNameResult>> {
    return this.templateRegistry.findTemplateByName(name).then(useCaseResult);
  }
}

export class ListTemplatesByCategoryUseCase {
  constructor(private readonly templateRegistry: AiTemplateRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListTemplatesByCategoryResult>> {
    return this.templateRegistry.listTemplatesByCategory(category).then(useCaseResult);
  }
}

export class GetTemplateRegistryStatisticsUseCase {
  constructor(private readonly templateRegistry: AiTemplateRegistryService) {}

  execute(): Promise<UseCaseResult<TemplateRegistryStatistics>> {
    return this.templateRegistry.getTemplateRegistryStatistics().then(useCaseResult);
  }
}
