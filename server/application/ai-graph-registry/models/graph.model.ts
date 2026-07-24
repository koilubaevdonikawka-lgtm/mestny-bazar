/** Registered AI graph — generic graph metadata only, no domain knowledge. */
export interface Graph {
  readonly graphId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterGraphInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateGraphInput {
  readonly graphId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListGraphsResult {
  readonly graphs: readonly Graph[];
  readonly total: number;
}

export interface FindGraphByNameResult {
  readonly graph: Graph | null;
}

export interface ListGraphsByCategoryResult {
  readonly graphs: readonly Graph[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteGraphResult {
  readonly graphId: string;
  readonly deleted: boolean;
}

export interface GraphRegistryStatistics {
  readonly totalGraphs: number;
  readonly activeGraphs: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createGraph(input: {
  graphId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Graph {
  const now = new Date().toISOString();
  return Object.freeze({
    graphId: input.graphId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
