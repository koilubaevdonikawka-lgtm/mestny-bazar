import type {
  RegisterWorkflowTemplateInput,
  UpdateWorkflowTemplateInput,
} from "@server/application/ai-workflow-template-registry/models/workflow-template.model";
import {
  DeleteWorkflowTemplateUseCase,
  FindWorkflowTemplateByNameUseCase,
  GetWorkflowTemplateRegistryStatisticsUseCase,
  GetWorkflowTemplateUseCase,
  ListWorkflowTemplatesByCategoryUseCase,
  ListWorkflowTemplatesUseCase,
  RegisterWorkflowTemplateUseCase,
  UpdateWorkflowTemplateUseCase,
} from "@server/application/ai-workflow-template-registry/use-cases/ai-workflow-template-registry.use-cases";

/** Application facade for AI Workflow Template Registry scenario. */
export class AiWorkflowTemplateRegistryApplicationService {
  constructor(
    private readonly registerWorkflowTemplateUseCase: RegisterWorkflowTemplateUseCase,
    private readonly getWorkflowTemplateUseCase: GetWorkflowTemplateUseCase,
    private readonly listWorkflowTemplatesUseCase: ListWorkflowTemplatesUseCase,
    private readonly updateWorkflowTemplateUseCase: UpdateWorkflowTemplateUseCase,
    private readonly deleteWorkflowTemplateUseCase: DeleteWorkflowTemplateUseCase,
    private readonly findWorkflowTemplateByNameUseCase: FindWorkflowTemplateByNameUseCase,
    private readonly listWorkflowTemplatesByCategoryUseCase: ListWorkflowTemplatesByCategoryUseCase,
    private readonly getWorkflowTemplateRegistryStatisticsUseCase: GetWorkflowTemplateRegistryStatisticsUseCase,
  ) {}

  registerWorkflowTemplate(input: RegisterWorkflowTemplateInput) {
    return this.registerWorkflowTemplateUseCase.execute(input);
  }

  getWorkflowTemplate(workflowTemplateId: string) {
    return this.getWorkflowTemplateUseCase.execute(workflowTemplateId);
  }

  listWorkflowTemplates() {
    return this.listWorkflowTemplatesUseCase.execute();
  }

  updateWorkflowTemplate(input: UpdateWorkflowTemplateInput) {
    return this.updateWorkflowTemplateUseCase.execute(input);
  }

  deleteWorkflowTemplate(workflowTemplateId: string) {
    return this.deleteWorkflowTemplateUseCase.execute(workflowTemplateId);
  }

  findWorkflowTemplateByName(name: string) {
    return this.findWorkflowTemplateByNameUseCase.execute(name);
  }

  listWorkflowTemplatesByCategory(category: string) {
    return this.listWorkflowTemplatesByCategoryUseCase.execute(category);
  }

  getWorkflowTemplateRegistryStatistics() {
    return this.getWorkflowTemplateRegistryStatisticsUseCase.execute();
  }
}
