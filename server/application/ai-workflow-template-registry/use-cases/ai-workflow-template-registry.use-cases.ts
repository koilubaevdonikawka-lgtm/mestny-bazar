import type {
  DeleteWorkflowTemplateResult,
  FindWorkflowTemplateByNameResult,
  ListWorkflowTemplatesByCategoryResult,
  ListWorkflowTemplatesResult,
  RegisterWorkflowTemplateInput,
  WorkflowTemplate,
  WorkflowTemplateRegistryStatistics,
  UpdateWorkflowTemplateInput,
} from "@server/application/ai-workflow-template-registry/models/workflow-template.model";
import type { AiWorkflowTemplateRegistryService } from "@server/application/ai-workflow-template-registry/services/ai-workflow-template-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterWorkflowTemplateUseCase {
  constructor(private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryService) {}

  execute(input: RegisterWorkflowTemplateInput): Promise<UseCaseResult<WorkflowTemplate>> {
    return this.workflowTemplateRegistry.registerWorkflowTemplate(input).then(useCaseResult);
  }
}

export class GetWorkflowTemplateUseCase {
  constructor(private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryService) {}

  execute(workflowTemplateId: string): Promise<UseCaseResult<WorkflowTemplate | null>> {
    return this.workflowTemplateRegistry.getWorkflowTemplate(workflowTemplateId).then(useCaseResult);
  }
}

export class ListWorkflowTemplatesUseCase {
  constructor(private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryService) {}

  execute(): Promise<UseCaseResult<ListWorkflowTemplatesResult>> {
    return this.workflowTemplateRegistry.listWorkflowTemplates().then(useCaseResult);
  }
}

export class UpdateWorkflowTemplateUseCase {
  constructor(private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryService) {}

  execute(input: UpdateWorkflowTemplateInput): Promise<UseCaseResult<WorkflowTemplate>> {
    return this.workflowTemplateRegistry.updateWorkflowTemplate(input).then(useCaseResult);
  }
}

export class DeleteWorkflowTemplateUseCase {
  constructor(private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryService) {}

  execute(workflowTemplateId: string): Promise<UseCaseResult<DeleteWorkflowTemplateResult>> {
    return this.workflowTemplateRegistry.deleteWorkflowTemplate(workflowTemplateId).then(useCaseResult);
  }
}

export class FindWorkflowTemplateByNameUseCase {
  constructor(private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindWorkflowTemplateByNameResult>> {
    return this.workflowTemplateRegistry.findWorkflowTemplateByName(name).then(useCaseResult);
  }
}

export class ListWorkflowTemplatesByCategoryUseCase {
  constructor(private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListWorkflowTemplatesByCategoryResult>> {
    return this.workflowTemplateRegistry.listWorkflowTemplatesByCategory(category).then(useCaseResult);
  }
}

export class GetWorkflowTemplateRegistryStatisticsUseCase {
  constructor(private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryService) {}

  execute(): Promise<UseCaseResult<WorkflowTemplateRegistryStatistics>> {
    return this.workflowTemplateRegistry.getWorkflowTemplateRegistryStatistics().then(useCaseResult);
  }
}
