/** Registered AI experiment — generic experiment metadata only, no domain knowledge. */
export interface Experiment {
  readonly experimentId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterExperimentInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateExperimentInput {
  readonly experimentId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListExperimentsResult {
  readonly experiments: readonly Experiment[];
  readonly total: number;
}

export interface FindExperimentByNameResult {
  readonly experiment: Experiment | null;
}

export interface ListExperimentsByCategoryResult {
  readonly experiments: readonly Experiment[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteExperimentResult {
  readonly experimentId: string;
  readonly deleted: boolean;
}

export interface ExperimentRegistryStatistics {
  readonly totalExperiments: number;
  readonly activeExperiments: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createExperiment(input: {
  experimentId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Experiment {
  const now = new Date().toISOString();
  return Object.freeze({
    experimentId: input.experimentId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
