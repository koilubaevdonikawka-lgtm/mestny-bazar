/** Registered AI execution environment — generic execution environment metadata only, no domain knowledge. */
export interface ExecutionEnvironment {
  readonly executionEnvironmentId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterExecutionEnvironmentInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateExecutionEnvironmentInput {
  readonly executionEnvironmentId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListExecutionEnvironmentsResult {
  readonly executionEnvironments: readonly ExecutionEnvironment[];
  readonly total: number;
}

export interface FindExecutionEnvironmentByNameResult {
  readonly executionEnvironment: ExecutionEnvironment | null;
}

export interface ListExecutionEnvironmentsByCategoryResult {
  readonly executionEnvironments: readonly ExecutionEnvironment[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteExecutionEnvironmentResult {
  readonly executionEnvironmentId: string;
  readonly deleted: boolean;
}

export interface ExecutionEnvironmentRegistryStatistics {
  readonly totalExecutionEnvironments: number;
  readonly activeExecutionEnvironments: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createExecutionEnvironment(input: {
  executionEnvironmentId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ExecutionEnvironment {
  const now = new Date().toISOString();
  return Object.freeze({
    executionEnvironmentId: input.executionEnvironmentId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
