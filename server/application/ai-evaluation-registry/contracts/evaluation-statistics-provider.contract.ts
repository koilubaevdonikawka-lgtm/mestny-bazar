import type { EvaluationRegistryStatistics } from "@server/application/ai-evaluation-registry/models/evaluation.model";

export interface IEvaluationStatisticsProvider {
  getStatistics(input: {
    totalEvaluations: number;
    activeEvaluations: number;
    categories: readonly string[];
  }): Promise<EvaluationRegistryStatistics>;
}
