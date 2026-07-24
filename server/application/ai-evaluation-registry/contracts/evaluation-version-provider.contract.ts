import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** Future integration point for evaluation version management. Not wired yet. */
export interface IEvaluationVersionProvider {
  listVersions(evaluationId: string): Promise<readonly Evaluation[]>;
  getVersion(evaluationId: string, version: string): Promise<Evaluation | null>;
}
