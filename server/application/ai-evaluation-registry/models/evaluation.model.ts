/** Registered AI evaluation — generic evaluation metadata only, no domain knowledge. */
export interface Evaluation {
  readonly evaluationId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterEvaluationInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateEvaluationInput {
  readonly evaluationId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListEvaluationsResult {
  readonly evaluations: readonly Evaluation[];
  readonly total: number;
}

export interface FindEvaluationByNameResult {
  readonly evaluation: Evaluation | null;
}

export interface ListEvaluationsByCategoryResult {
  readonly evaluations: readonly Evaluation[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteEvaluationResult {
  readonly evaluationId: string;
  readonly deleted: boolean;
}

export interface EvaluationRegistryStatistics {
  readonly totalEvaluations: number;
  readonly activeEvaluations: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createEvaluation(input: {
  evaluationId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Evaluation {
  const now = new Date().toISOString();
  return Object.freeze({
    evaluationId: input.evaluationId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
