import type {
  DeleteExperimentResult,
  FindExperimentByNameResult,
  ListExperimentsByCategoryResult,
  ListExperimentsResult,
  RegisterExperimentInput,
  Experiment,
  ExperimentRegistryStatistics,
  UpdateExperimentInput,
} from "@server/application/ai-experiment-registry/models/experiment.model";
import type { AiExperimentRegistryService } from "@server/application/ai-experiment-registry/services/ai-experiment-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterExperimentUseCase {
  constructor(private readonly experimentRegistry: AiExperimentRegistryService) {}

  execute(input: RegisterExperimentInput): Promise<UseCaseResult<Experiment>> {
    return this.experimentRegistry.registerExperiment(input).then(useCaseResult);
  }
}

export class GetExperimentUseCase {
  constructor(private readonly experimentRegistry: AiExperimentRegistryService) {}

  execute(experimentId: string): Promise<UseCaseResult<Experiment | null>> {
    return this.experimentRegistry.getExperiment(experimentId).then(useCaseResult);
  }
}

export class ListExperimentsUseCase {
  constructor(private readonly experimentRegistry: AiExperimentRegistryService) {}

  execute(): Promise<UseCaseResult<ListExperimentsResult>> {
    return this.experimentRegistry.listExperiments().then(useCaseResult);
  }
}

export class UpdateExperimentUseCase {
  constructor(private readonly experimentRegistry: AiExperimentRegistryService) {}

  execute(input: UpdateExperimentInput): Promise<UseCaseResult<Experiment>> {
    return this.experimentRegistry.updateExperiment(input).then(useCaseResult);
  }
}

export class DeleteExperimentUseCase {
  constructor(private readonly experimentRegistry: AiExperimentRegistryService) {}

  execute(experimentId: string): Promise<UseCaseResult<DeleteExperimentResult>> {
    return this.experimentRegistry.deleteExperiment(experimentId).then(useCaseResult);
  }
}

export class FindExperimentByNameUseCase {
  constructor(private readonly experimentRegistry: AiExperimentRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindExperimentByNameResult>> {
    return this.experimentRegistry.findExperimentByName(name).then(useCaseResult);
  }
}

export class ListExperimentsByCategoryUseCase {
  constructor(private readonly experimentRegistry: AiExperimentRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListExperimentsByCategoryResult>> {
    return this.experimentRegistry.listExperimentsByCategory(category).then(useCaseResult);
  }
}

export class GetExperimentRegistryStatisticsUseCase {
  constructor(private readonly experimentRegistry: AiExperimentRegistryService) {}

  execute(): Promise<UseCaseResult<ExperimentRegistryStatistics>> {
    return this.experimentRegistry.getExperimentRegistryStatistics().then(useCaseResult);
  }
}
