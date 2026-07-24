import type {
  DeleteWorkflowResult,
  FindWorkflowByNameResult,
  ListWorkflowsByCategoryResult,
  ListWorkflowsResult,
  RegisterWorkflowInput,
  UpdateWorkflowInput,
  Workflow,
  WorkflowRegistryStatistics,
} from "@server/application/ai-workflow-registry/models/workflow.model";
import type { AiWorkflowRegistryService } from "@server/application/ai-workflow-registry/services/ai-workflow-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterWorkflowUseCase {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryService) {}

  execute(input: RegisterWorkflowInput): Promise<UseCaseResult<Workflow>> {
    return this.workflowRegistry.registerWorkflow(input).then(useCaseResult);
  }
}

export class GetWorkflowUseCase {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryService) {}

  execute(workflowId: string): Promise<UseCaseResult<Workflow | null>> {
    return this.workflowRegistry.getWorkflow(workflowId).then(useCaseResult);
  }
}

export class ListWorkflowsUseCase {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryService) {}

  execute(): Promise<UseCaseResult<ListWorkflowsResult>> {
    return this.workflowRegistry.listWorkflows().then(useCaseResult);
  }
}

export class UpdateWorkflowUseCase {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryService) {}

  execute(input: UpdateWorkflowInput): Promise<UseCaseResult<Workflow>> {
    return this.workflowRegistry.updateWorkflow(input).then(useCaseResult);
  }
}

export class DeleteWorkflowUseCase {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryService) {}

  execute(workflowId: string): Promise<UseCaseResult<DeleteWorkflowResult>> {
    return this.workflowRegistry.deleteWorkflow(workflowId).then(useCaseResult);
  }
}

export class FindWorkflowByNameUseCase {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindWorkflowByNameResult>> {
    return this.workflowRegistry.findWorkflowByName(name).then(useCaseResult);
  }
}

export class ListWorkflowsByCategoryUseCase {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListWorkflowsByCategoryResult>> {
    return this.workflowRegistry.listWorkflowsByCategory(category).then(useCaseResult);
  }
}

export class GetWorkflowRegistryStatisticsUseCase {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryService) {}

  execute(): Promise<UseCaseResult<WorkflowRegistryStatistics>> {
    return this.workflowRegistry.getWorkflowRegistryStatistics().then(useCaseResult);
  }
}
