import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** Future integration point for external evaluation providers. Not wired yet. */
export interface IRemoteEvaluationProvider {
  fetchRemote(evaluationId: string): Promise<Evaluation | null>;
  pushRemote(evaluation: Evaluation): Promise<void>;
}
