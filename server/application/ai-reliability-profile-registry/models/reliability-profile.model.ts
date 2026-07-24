/** Registered AI reliability profile — generic reliability profile metadata only, no domain knowledge. */
export interface ReliabilityProfile {
  readonly reliabilityProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterReliabilityProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateReliabilityProfileInput {
  readonly reliabilityProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListReliabilityProfilesResult {
  readonly reliabilityProfiles: readonly ReliabilityProfile[];
  readonly total: number;
}

export interface FindReliabilityProfileByNameResult {
  readonly reliabilityProfile: ReliabilityProfile | null;
}

export interface ListReliabilityProfilesByCategoryResult {
  readonly reliabilityProfiles: readonly ReliabilityProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteReliabilityProfileResult {
  readonly reliabilityProfileId: string;
  readonly deleted: boolean;
}

export interface ReliabilityProfileRegistryStatistics {
  readonly totalReliabilityProfiles: number;
  readonly activeReliabilityProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createReliabilityProfile(input: {
  reliabilityProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ReliabilityProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    reliabilityProfileId: input.reliabilityProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
