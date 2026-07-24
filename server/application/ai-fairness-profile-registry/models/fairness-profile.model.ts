/** Registered AI fairness profile — generic fairness profile metadata only, no domain knowledge. */
export interface FairnessProfile {
  readonly fairnessProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterFairnessProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateFairnessProfileInput {
  readonly fairnessProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListFairnessProfilesResult {
  readonly fairnessProfiles: readonly FairnessProfile[];
  readonly total: number;
}

export interface FindFairnessProfileByNameResult {
  readonly fairnessProfile: FairnessProfile | null;
}

export interface ListFairnessProfilesByCategoryResult {
  readonly fairnessProfiles: readonly FairnessProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteFairnessProfileResult {
  readonly fairnessProfileId: string;
  readonly deleted: boolean;
}

export interface FairnessProfileRegistryStatistics {
  readonly totalFairnessProfiles: number;
  readonly activeFairnessProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createFairnessProfile(input: {
  fairnessProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): FairnessProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    fairnessProfileId: input.fairnessProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
