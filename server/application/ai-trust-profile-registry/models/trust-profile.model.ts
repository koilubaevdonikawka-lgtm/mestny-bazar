/** Registered AI trust profile — generic trust profile metadata only, no domain knowledge. */
export interface TrustProfile {
  readonly trustProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterTrustProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateTrustProfileInput {
  readonly trustProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListTrustProfilesResult {
  readonly trustProfiles: readonly TrustProfile[];
  readonly total: number;
}

export interface FindTrustProfileByNameResult {
  readonly trustProfile: TrustProfile | null;
}

export interface ListTrustProfilesByCategoryResult {
  readonly trustProfiles: readonly TrustProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteTrustProfileResult {
  readonly trustProfileId: string;
  readonly deleted: boolean;
}

export interface TrustProfileRegistryStatistics {
  readonly totalTrustProfiles: number;
  readonly activeTrustProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createTrustProfile(input: {
  trustProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): TrustProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    trustProfileId: input.trustProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
