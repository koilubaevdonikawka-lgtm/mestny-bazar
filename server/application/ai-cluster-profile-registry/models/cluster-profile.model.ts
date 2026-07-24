/** Registered AI cluster profile — generic cluster profile metadata only, no domain knowledge. */
export interface ClusterProfile {
  readonly clusterProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterClusterProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateClusterProfileInput {
  readonly clusterProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListClusterProfilesResult {
  readonly clusterProfiles: readonly ClusterProfile[];
  readonly total: number;
}

export interface FindClusterProfileByNameResult {
  readonly clusterProfile: ClusterProfile | null;
}

export interface ListClusterProfilesByCategoryResult {
  readonly clusterProfiles: readonly ClusterProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteClusterProfileResult {
  readonly clusterProfileId: string;
  readonly deleted: boolean;
}

export interface ClusterProfileRegistryStatistics {
  readonly totalClusterProfiles: number;
  readonly activeClusterProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createClusterProfile(input: {
  clusterProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ClusterProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    clusterProfileId: input.clusterProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
