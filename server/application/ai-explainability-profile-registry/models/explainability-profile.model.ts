/** Registered AI explainability profile — generic explainability profile metadata only, no domain knowledge. */
export interface ExplainabilityProfile {
  readonly explainabilityProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterExplainabilityProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateExplainabilityProfileInput {
  readonly explainabilityProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListExplainabilityProfilesResult {
  readonly explainabilityProfiles: readonly ExplainabilityProfile[];
  readonly total: number;
}

export interface FindExplainabilityProfileByNameResult {
  readonly explainabilityProfile: ExplainabilityProfile | null;
}

export interface ListExplainabilityProfilesByCategoryResult {
  readonly explainabilityProfiles: readonly ExplainabilityProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteExplainabilityProfileResult {
  readonly explainabilityProfileId: string;
  readonly deleted: boolean;
}

export interface ExplainabilityProfileRegistryStatistics {
  readonly totalExplainabilityProfiles: number;
  readonly activeExplainabilityProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createExplainabilityProfile(input: {
  explainabilityProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ExplainabilityProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    explainabilityProfileId: input.explainabilityProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
