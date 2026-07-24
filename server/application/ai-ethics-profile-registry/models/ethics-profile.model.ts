/** Registered AI ethics profile — generic ethics profile metadata only, no domain knowledge. */
export interface EthicsProfile {
  readonly ethicsProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterEthicsProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateEthicsProfileInput {
  readonly ethicsProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListEthicsProfilesResult {
  readonly ethicsProfiles: readonly EthicsProfile[];
  readonly total: number;
}

export interface FindEthicsProfileByNameResult {
  readonly ethicsProfile: EthicsProfile | null;
}

export interface ListEthicsProfilesByCategoryResult {
  readonly ethicsProfiles: readonly EthicsProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteEthicsProfileResult {
  readonly ethicsProfileId: string;
  readonly deleted: boolean;
}

export interface EthicsProfileRegistryStatistics {
  readonly totalEthicsProfiles: number;
  readonly activeEthicsProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createEthicsProfile(input: {
  ethicsProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): EthicsProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    ethicsProfileId: input.ethicsProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
