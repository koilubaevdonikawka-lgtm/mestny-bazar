import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** Future integration point for evaluation export. Not wired yet. */
export interface IEvaluationExportProvider {
  exportTo(evaluations: readonly Evaluation[]): Promise<string>;
}
