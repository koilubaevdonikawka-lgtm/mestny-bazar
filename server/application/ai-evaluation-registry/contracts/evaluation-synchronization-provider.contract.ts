import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** Future integration point for evaluation synchronization. Not wired yet. */
export interface IEvaluationSynchronizationProvider {
  synchronize(evaluations: readonly Evaluation[]): Promise<void>;
}
