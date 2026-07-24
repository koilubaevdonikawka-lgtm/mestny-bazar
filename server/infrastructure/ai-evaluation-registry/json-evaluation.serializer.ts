import type { IEvaluationSerializer } from "@server/application/ai-evaluation-registry/contracts/evaluation-serializer.contract";
import {
  createEvaluation,
  type Evaluation,
} from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** JSON-based evaluation serializer. */
export class JsonEvaluationSerializer implements IEvaluationSerializer {
  async serialize(evaluation: Evaluation): Promise<string> {
    return JSON.stringify(evaluation);
  }

  async deserialize(serialized: string): Promise<Evaluation> {
    if (!serialized.trim()) {
      throw new Error("Serialized evaluation cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Evaluation>;
    return createEvaluation({
      evaluationId: parsed.evaluationId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
