import type {
  DeleteExecutionEnvironmentResult,
  ExecutionEnvironment,
  ExecutionEnvironmentRegistryStatistics,
  FindExecutionEnvironmentByNameResult,
  ListExecutionEnvironmentsByCategoryResult,
  ListExecutionEnvironmentsResult,
  RegisterExecutionEnvironmentInput,
  UpdateExecutionEnvironmentInput,
} from "@server/application/ai-execution-environment-registry/models/execution-environment.model";
import type { AiExecutionEnvironmentRegistryService } from "@server/application/ai-execution-environment-registry/services/ai-execution-environment-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterExecutionEnvironmentUseCase {
  constructor(private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryService) {}

  execute(input: RegisterExecutionEnvironmentInput): Promise<UseCaseResult<ExecutionEnvironment>> {
    return this.executionEnvironmentRegistry.registerExecutionEnvironment(input).then(useCaseResult);
  }
}

export class GetExecutionEnvironmentUseCase {
  constructor(private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryService) {}

  execute(executionEnvironmentId: string): Promise<UseCaseResult<ExecutionEnvironment | null>> {
    return this.executionEnvironmentRegistry.getExecutionEnvironment(executionEnvironmentId).then(useCaseResult);
  }
}

export class ListExecutionEnvironmentsUseCase {
  constructor(private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryService) {}

  execute(): Promise<UseCaseResult<ListExecutionEnvironmentsResult>> {
    return this.executionEnvironmentRegistry.listExecutionEnvironments().then(useCaseResult);
  }
}

export class UpdateExecutionEnvironmentUseCase {
  constructor(private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryService) {}

  execute(input: UpdateExecutionEnvironmentInput): Promise<UseCaseResult<ExecutionEnvironment>> {
    return this.executionEnvironmentRegistry.updateExecutionEnvironment(input).then(useCaseResult);
  }
}

export class DeleteExecutionEnvironmentUseCase {
  constructor(private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryService) {}

  execute(executionEnvironmentId: string): Promise<UseCaseResult<DeleteExecutionEnvironmentResult>> {
    return this.executionEnvironmentRegistry.deleteExecutionEnvironment(executionEnvironmentId).then(useCaseResult);
  }
}

export class FindExecutionEnvironmentByNameUseCase {
  constructor(private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindExecutionEnvironmentByNameResult>> {
    return this.executionEnvironmentRegistry.findExecutionEnvironmentByName(name).then(useCaseResult);
  }
}

export class ListExecutionEnvironmentsByCategoryUseCase {
  constructor(private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListExecutionEnvironmentsByCategoryResult>> {
    return this.executionEnvironmentRegistry.listExecutionEnvironmentsByCategory(category).then(useCaseResult);
  }
}

export class GetExecutionEnvironmentRegistryStatisticsUseCase {
  constructor(private readonly executionEnvironmentRegistry: AiExecutionEnvironmentRegistryService) {}

  execute(): Promise<UseCaseResult<ExecutionEnvironmentRegistryStatistics>> {
    return this.executionEnvironmentRegistry.getExecutionEnvironmentRegistryStatistics().then(useCaseResult);
  }
}
