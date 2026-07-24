/** Registered AI governance profile — generic governance profile metadata only, no domain knowledge. */
export interface GovernanceProfile {
  readonly governanceProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterGovernanceProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateGovernanceProfileInput {
  readonly governanceProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListGovernanceProfilesResult {
  readonly governanceProfiles: readonly GovernanceProfile[];
  readonly total: number;
}

export interface FindGovernanceProfileByNameResult {
  readonly governanceProfile: GovernanceProfile | null;
}

export interface ListGovernanceProfilesByCategoryResult {
  readonly governanceProfiles: readonly GovernanceProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteGovernanceProfileResult {
  readonly governanceProfileId: string;
  readonly deleted: boolean;
}

export interface GovernanceProfileRegistryStatistics {
  readonly totalGovernanceProfiles: number;
  readonly activeGovernanceProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createGovernanceProfile(input: {
  governanceProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): GovernanceProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    governanceProfileId: input.governanceProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
