import type {
  DeleteEvaluationResult,
  FindEvaluationByNameResult,
  ListEvaluationsByCategoryResult,
  ListEvaluationsResult,
  RegisterEvaluationInput,
  Evaluation,
  EvaluationRegistryStatistics,
  UpdateEvaluationInput,
} from "@server/application/ai-evaluation-registry/models/evaluation.model";
import type { AiEvaluationRegistryService } from "@server/application/ai-evaluation-registry/services/ai-evaluation-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterEvaluationUseCase {
  constructor(private readonly evaluationRegistry: AiEvaluationRegistryService) {}

  execute(input: RegisterEvaluationInput): Promise<UseCaseResult<Evaluation>> {
    return this.evaluationRegistry.registerEvaluation(input).then(useCaseResult);
  }
}

export class GetEvaluationUseCase {
  constructor(private readonly evaluationRegistry: AiEvaluationRegistryService) {}

  execute(evaluationId: string): Promise<UseCaseResult<Evaluation | null>> {
    return this.evaluationRegistry.getEvaluation(evaluationId).then(useCaseResult);
  }
}

export class ListEvaluationsUseCase {
  constructor(private readonly evaluationRegistry: AiEvaluationRegistryService) {}

  execute(): Promise<UseCaseResult<ListEvaluationsResult>> {
    return this.evaluationRegistry.listEvaluations().then(useCaseResult);
  }
}

export class UpdateEvaluationUseCase {
  constructor(private readonly evaluationRegistry: AiEvaluationRegistryService) {}

  execute(input: UpdateEvaluationInput): Promise<UseCaseResult<Evaluation>> {
    return this.evaluationRegistry.updateEvaluation(input).then(useCaseResult);
  }
}

export class DeleteEvaluationUseCase {
  constructor(private readonly evaluationRegistry: AiEvaluationRegistryService) {}

  execute(evaluationId: string): Promise<UseCaseResult<DeleteEvaluationResult>> {
    return this.evaluationRegistry.deleteEvaluation(evaluationId).then(useCaseResult);
  }
}

export class FindEvaluationByNameUseCase {
  constructor(private readonly evaluationRegistry: AiEvaluationRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindEvaluationByNameResult>> {
    return this.evaluationRegistry.findEvaluationByName(name).then(useCaseResult);
  }
}

export class ListEvaluationsByCategoryUseCase {
  constructor(private readonly evaluationRegistry: AiEvaluationRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListEvaluationsByCategoryResult>> {
    return this.evaluationRegistry.listEvaluationsByCategory(category).then(useCaseResult);
  }
}

export class GetEvaluationRegistryStatisticsUseCase {
  constructor(private readonly evaluationRegistry: AiEvaluationRegistryService) {}

  execute(): Promise<UseCaseResult<EvaluationRegistryStatistics>> {
    return this.evaluationRegistry.getEvaluationRegistryStatistics().then(useCaseResult);
  }
}
