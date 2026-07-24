import type {
  RegisterWorkflowInput,
  UpdateWorkflowInput,
} from "@server/application/ai-workflow-registry/models/workflow.model";
import {
  DeleteWorkflowUseCase,
  FindWorkflowByNameUseCase,
  GetWorkflowRegistryStatisticsUseCase,
  GetWorkflowUseCase,
  ListWorkflowsByCategoryUseCase,
  ListWorkflowsUseCase,
  RegisterWorkflowUseCase,
  UpdateWorkflowUseCase,
} from "@server/application/ai-workflow-registry/use-cases/ai-workflow-registry.use-cases";

/** Application facade for AI Workflow Registry scenario. */
export class AiWorkflowRegistryApplicationService {
  constructor(
    private readonly registerWorkflowUseCase: RegisterWorkflowUseCase,
    private readonly getWorkflowUseCase: GetWorkflowUseCase,
    private readonly listWorkflowsUseCase: ListWorkflowsUseCase,
    private readonly updateWorkflowUseCase: UpdateWorkflowUseCase,
    private readonly deleteWorkflowUseCase: DeleteWorkflowUseCase,
    private readonly findWorkflowByNameUseCase: FindWorkflowByNameUseCase,
    private readonly listWorkflowsByCategoryUseCase: ListWorkflowsByCategoryUseCase,
    private readonly getWorkflowRegistryStatisticsUseCase: GetWorkflowRegistryStatisticsUseCase,
  ) {}

  registerWorkflow(input: RegisterWorkflowInput) {
    return this.registerWorkflowUseCase.execute(input);
  }

  getWorkflow(workflowId: string) {
    return this.getWorkflowUseCase.execute(workflowId);
  }

  listWorkflows() {
    return this.listWorkflowsUseCase.execute();
  }

  updateWorkflow(input: UpdateWorkflowInput) {
    return this.updateWorkflowUseCase.execute(input);
  }

  deleteWorkflow(workflowId: string) {
    return this.deleteWorkflowUseCase.execute(workflowId);
  }

  findWorkflowByName(name: string) {
    return this.findWorkflowByNameUseCase.execute(name);
  }

  listWorkflowsByCategory(category: string) {
    return this.listWorkflowsByCategoryUseCase.execute(category);
  }

  getWorkflowRegistryStatistics() {
    return this.getWorkflowRegistryStatisticsUseCase.execute();
  }
}
