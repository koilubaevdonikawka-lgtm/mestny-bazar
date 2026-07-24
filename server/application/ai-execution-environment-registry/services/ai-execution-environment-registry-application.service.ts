import type {
  RegisterExecutionEnvironmentInput,
  UpdateExecutionEnvironmentInput,
} from "@server/application/ai-execution-environment-registry/models/execution-environment.model";
import {
  DeleteExecutionEnvironmentUseCase,
  FindExecutionEnvironmentByNameUseCase,
  GetExecutionEnvironmentRegistryStatisticsUseCase,
  GetExecutionEnvironmentUseCase,
  ListExecutionEnvironmentsByCategoryUseCase,
  ListExecutionEnvironmentsUseCase,
  RegisterExecutionEnvironmentUseCase,
  UpdateExecutionEnvironmentUseCase,
} from "@server/application/ai-execution-environment-registry/use-cases/ai-execution-environment-registry.use-cases";

/** Application facade for AI Execution Environment Registry scenario. */
export class AiExecutionEnvironmentRegistryApplicationService {
  constructor(
    private readonly registerExecutionEnvironmentUseCase: RegisterExecutionEnvironmentUseCase,
    private readonly getExecutionEnvironmentUseCase: GetExecutionEnvironmentUseCase,
    private readonly listExecutionEnvironmentsUseCase: ListExecutionEnvironmentsUseCase,
    private readonly updateExecutionEnvironmentUseCase: UpdateExecutionEnvironmentUseCase,
    private readonly deleteExecutionEnvironmentUseCase: DeleteExecutionEnvironmentUseCase,
    private readonly findExecutionEnvironmentByNameUseCase: FindExecutionEnvironmentByNameUseCase,
    private readonly listExecutionEnvironmentsByCategoryUseCase: ListExecutionEnvironmentsByCategoryUseCase,
    private readonly getExecutionEnvironmentRegistryStatisticsUseCase: GetExecutionEnvironmentRegistryStatisticsUseCase,
  ) {}

  registerExecutionEnvironment(input: RegisterExecutionEnvironmentInput) {
    return this.registerExecutionEnvironmentUseCase.execute(input);
  }

  getExecutionEnvironment(executionEnvironmentId: string) {
    return this.getExecutionEnvironmentUseCase.execute(executionEnvironmentId);
  }

  listExecutionEnvironments() {
    return this.listExecutionEnvironmentsUseCase.execute();
  }

  updateExecutionEnvironment(input: UpdateExecutionEnvironmentInput) {
    return this.updateExecutionEnvironmentUseCase.execute(input);
  }

  deleteExecutionEnvironment(executionEnvironmentId: string) {
    return this.deleteExecutionEnvironmentUseCase.execute(executionEnvironmentId);
  }

  findExecutionEnvironmentByName(name: string) {
    return this.findExecutionEnvironmentByNameUseCase.execute(name);
  }

  listExecutionEnvironmentsByCategory(category: string) {
    return this.listExecutionEnvironmentsByCategoryUseCase.execute(category);
  }

  getExecutionEnvironmentRegistryStatistics() {
    return this.getExecutionEnvironmentRegistryStatisticsUseCase.execute();
  }
}
