import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

export interface IEvaluationCatalog {
  register(evaluation: Evaluation): Promise<void>;
  remove(evaluationId: string): Promise<void>;
  findById(evaluationId: string): Promise<Evaluation | null>;
  findByName(name: string): Promise<Evaluation | null>;
  findByCategory(category: string): Promise<readonly Evaluation[]>;
  listAll(): Promise<readonly Evaluation[]>;
}
