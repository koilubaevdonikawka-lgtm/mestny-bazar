import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

export interface IEvaluationSerializer {
  serialize(evaluation: Evaluation): Promise<string>;
  deserialize(serialized: string): Promise<Evaluation>;
}
