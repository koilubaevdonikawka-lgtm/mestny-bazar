/** Registered AI network profile — generic network profile metadata only, no domain knowledge. */
export interface NetworkProfile {
  readonly networkProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterNetworkProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateNetworkProfileInput {
  readonly networkProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListNetworkProfilesResult {
  readonly networkProfiles: readonly NetworkProfile[];
  readonly total: number;
}

export interface FindNetworkProfileByNameResult {
  readonly networkProfile: NetworkProfile | null;
}

export interface ListNetworkProfilesByCategoryResult {
  readonly networkProfiles: readonly NetworkProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteNetworkProfileResult {
  readonly networkProfileId: string;
  readonly deleted: boolean;
}

export interface NetworkProfileRegistryStatistics {
  readonly totalNetworkProfiles: number;
  readonly activeNetworkProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createNetworkProfile(input: {
  networkProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): NetworkProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    networkProfileId: input.networkProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
