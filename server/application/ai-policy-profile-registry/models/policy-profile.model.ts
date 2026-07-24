/** Registered AI policy profile — generic policy profile metadata only, no domain knowledge. */
export interface PolicyProfile {
  readonly policyProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterPolicyProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdatePolicyProfileInput {
  readonly policyProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListPolicyProfilesResult {
  readonly policyProfiles: readonly PolicyProfile[];
  readonly total: number;
}

export interface FindPolicyProfileByNameResult {
  readonly policyProfile: PolicyProfile | null;
}

export interface ListPolicyProfilesByCategoryResult {
  readonly policyProfiles: readonly PolicyProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeletePolicyProfileResult {
  readonly policyProfileId: string;
  readonly deleted: boolean;
}

export interface PolicyProfileRegistryStatistics {
  readonly totalPolicyProfiles: number;
  readonly activePolicyProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createPolicyProfile(input: {
  policyProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): PolicyProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    policyProfileId: input.policyProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
