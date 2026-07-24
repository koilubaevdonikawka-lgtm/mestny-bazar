import type {
  RegisterExperimentInput,
  UpdateExperimentInput,
} from "@server/application/ai-experiment-registry/models/experiment.model";
import {
  DeleteExperimentUseCase,
  FindExperimentByNameUseCase,
  GetExperimentRegistryStatisticsUseCase,
  GetExperimentUseCase,
  ListExperimentsByCategoryUseCase,
  ListExperimentsUseCase,
  RegisterExperimentUseCase,
  UpdateExperimentUseCase,
} from "@server/application/ai-experiment-registry/use-cases/ai-experiment-registry.use-cases";

/** Application facade for AI Experiment Registry scenario. */
export class AiExperimentRegistryApplicationService {
  constructor(
    private readonly registerExperimentUseCase: RegisterExperimentUseCase,
    private readonly getExperimentUseCase: GetExperimentUseCase,
    private readonly listExperimentsUseCase: ListExperimentsUseCase,
    private readonly updateExperimentUseCase: UpdateExperimentUseCase,
    private readonly deleteExperimentUseCase: DeleteExperimentUseCase,
    private readonly findExperimentByNameUseCase: FindExperimentByNameUseCase,
    private readonly listExperimentsByCategoryUseCase: ListExperimentsByCategoryUseCase,
    private readonly getExperimentRegistryStatisticsUseCase: GetExperimentRegistryStatisticsUseCase,
  ) {}

  registerExperiment(input: RegisterExperimentInput) {
    return this.registerExperimentUseCase.execute(input);
  }

  getExperiment(experimentId: string) {
    return this.getExperimentUseCase.execute(experimentId);
  }

  listExperiments() {
    return this.listExperimentsUseCase.execute();
  }

  updateExperiment(input: UpdateExperimentInput) {
    return this.updateExperimentUseCase.execute(input);
  }

  deleteExperiment(experimentId: string) {
    return this.deleteExperimentUseCase.execute(experimentId);
  }

  findExperimentByName(name: string) {
    return this.findExperimentByNameUseCase.execute(name);
  }

  listExperimentsByCategory(category: string) {
    return this.listExperimentsByCategoryUseCase.execute(category);
  }

  getExperimentRegistryStatistics() {
    return this.getExperimentRegistryStatisticsUseCase.execute();
  }
}
