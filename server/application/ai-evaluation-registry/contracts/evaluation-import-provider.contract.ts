import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** Future integration point for evaluation import. Not wired yet. */
export interface IEvaluationImportProvider {
  importFrom(source: string): Promise<readonly Evaluation[]>;
}
