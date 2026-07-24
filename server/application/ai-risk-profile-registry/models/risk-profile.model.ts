/** Registered AI risk profile — generic risk profile metadata only, no domain knowledge. */
export interface RiskProfile {
  readonly riskProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterRiskProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateRiskProfileInput {
  readonly riskProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListRiskProfilesResult {
  readonly riskProfiles: readonly RiskProfile[];
  readonly total: number;
}

export interface FindRiskProfileByNameResult {
  readonly riskProfile: RiskProfile | null;
}

export interface ListRiskProfilesByCategoryResult {
  readonly riskProfiles: readonly RiskProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteRiskProfileResult {
  readonly riskProfileId: string;
  readonly deleted: boolean;
}

export interface RiskProfileRegistryStatistics {
  readonly totalRiskProfiles: number;
  readonly activeRiskProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createRiskProfile(input: {
  riskProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): RiskProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    riskProfileId: input.riskProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
