import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

export interface IEvaluationRepository {
  save(evaluation: Evaluation): Promise<void>;
  findById(evaluationId: string): Promise<Evaluation | null>;
  findByName(name: string): Promise<Evaluation | null>;
  findByCategory(category: string): Promise<readonly Evaluation[]>;
  findAll(): Promise<readonly Evaluation[]>;
  delete(evaluationId: string): Promise<boolean>;
}
