import type { IEvaluationStatisticsProvider } from "@server/application/ai-evaluation-registry/contracts/evaluation-statistics-provider.contract";
import type { EvaluationRegistryStatistics } from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** Default in-memory evaluation statistics provider. */
export class DefaultEvaluationStatisticsProvider implements IEvaluationStatisticsProvider {
  async getStatistics(input: {
    totalEvaluations: number;
    activeEvaluations: number;
    categories: readonly string[];
  }): Promise<EvaluationRegistryStatistics> {
    return Object.freeze({
      totalEvaluations: input.totalEvaluations,
      activeEvaluations: input.activeEvaluations,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
