import type {
  RegisterEvaluationInput,
  UpdateEvaluationInput,
} from "@server/application/ai-evaluation-registry/models/evaluation.model";
import {
  DeleteEvaluationUseCase,
  FindEvaluationByNameUseCase,
  GetEvaluationRegistryStatisticsUseCase,
  GetEvaluationUseCase,
  ListEvaluationsByCategoryUseCase,
  ListEvaluationsUseCase,
  RegisterEvaluationUseCase,
  UpdateEvaluationUseCase,
} from "@server/application/ai-evaluation-registry/use-cases/ai-evaluation-registry.use-cases";

/** Application facade for AI Evaluation Registry scenario. */
export class AiEvaluationRegistryApplicationService {
  constructor(
    private readonly registerEvaluationUseCase: RegisterEvaluationUseCase,
    private readonly getEvaluationUseCase: GetEvaluationUseCase,
    private readonly listEvaluationsUseCase: ListEvaluationsUseCase,
    private readonly updateEvaluationUseCase: UpdateEvaluationUseCase,
    private readonly deleteEvaluationUseCase: DeleteEvaluationUseCase,
    private readonly findEvaluationByNameUseCase: FindEvaluationByNameUseCase,
    private readonly listEvaluationsByCategoryUseCase: ListEvaluationsByCategoryUseCase,
    private readonly getEvaluationRegistryStatisticsUseCase: GetEvaluationRegistryStatisticsUseCase,
  ) {}

  registerEvaluation(input: RegisterEvaluationInput) {
    return this.registerEvaluationUseCase.execute(input);
  }

  getEvaluation(evaluationId: string) {
    return this.getEvaluationUseCase.execute(evaluationId);
  }

  listEvaluations() {
    return this.listEvaluationsUseCase.execute();
  }

  updateEvaluation(input: UpdateEvaluationInput) {
    return this.updateEvaluationUseCase.execute(input);
  }

  deleteEvaluation(evaluationId: string) {
    return this.deleteEvaluationUseCase.execute(evaluationId);
  }

  findEvaluationByName(name: string) {
    return this.findEvaluationByNameUseCase.execute(name);
  }

  listEvaluationsByCategory(category: string) {
    return this.listEvaluationsByCategoryUseCase.execute(category);
  }

  getEvaluationRegistryStatistics() {
    return this.getEvaluationRegistryStatisticsUseCase.execute();
  }
}
