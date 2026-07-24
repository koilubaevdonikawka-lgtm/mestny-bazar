/** Registered AI execution profile — generic execution profile metadata only, no domain knowledge. */
export interface ExecutionProfile {
  readonly executionProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterExecutionProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateExecutionProfileInput {
  readonly executionProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListExecutionProfilesResult {
  readonly executionProfiles: readonly ExecutionProfile[];
  readonly total: number;
}

export interface FindExecutionProfileByNameResult {
  readonly executionProfile: ExecutionProfile | null;
}

export interface ListExecutionProfilesByCategoryResult {
  readonly executionProfiles: readonly ExecutionProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteExecutionProfileResult {
  readonly executionProfileId: string;
  readonly deleted: boolean;
}

export interface ExecutionProfileRegistryStatistics {
  readonly totalExecutionProfiles: number;
  readonly activeExecutionProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createExecutionProfile(input: {
  executionProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ExecutionProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    executionProfileId: input.executionProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
