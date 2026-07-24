/** Registered AI compute profile — generic compute profile metadata only, no domain knowledge. */
export interface ComputeProfile {
  readonly computeProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterComputeProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateComputeProfileInput {
  readonly computeProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListComputeProfilesResult {
  readonly computeProfiles: readonly ComputeProfile[];
  readonly total: number;
}

export interface FindComputeProfileByNameResult {
  readonly computeProfile: ComputeProfile | null;
}

export interface ListComputeProfilesByCategoryResult {
  readonly computeProfiles: readonly ComputeProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteComputeProfileResult {
  readonly computeProfileId: string;
  readonly deleted: boolean;
}

export interface ComputeProfileRegistryStatistics {
  readonly totalComputeProfiles: number;
  readonly activeComputeProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createComputeProfile(input: {
  computeProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ComputeProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    computeProfileId: input.computeProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
