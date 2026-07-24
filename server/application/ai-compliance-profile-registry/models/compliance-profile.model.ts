/** Registered AI compliance profile — generic compliance profile metadata only, no domain knowledge. */
export interface ComplianceProfile {
  readonly complianceProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterComplianceProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateComplianceProfileInput {
  readonly complianceProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListComplianceProfilesResult {
  readonly complianceProfiles: readonly ComplianceProfile[];
  readonly total: number;
}

export interface FindComplianceProfileByNameResult {
  readonly complianceProfile: ComplianceProfile | null;
}

export interface ListComplianceProfilesByCategoryResult {
  readonly complianceProfiles: readonly ComplianceProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteComplianceProfileResult {
  readonly complianceProfileId: string;
  readonly deleted: boolean;
}

export interface ComplianceProfileRegistryStatistics {
  readonly totalComplianceProfiles: number;
  readonly activeComplianceProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createComplianceProfile(input: {
  complianceProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ComplianceProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    complianceProfileId: input.complianceProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
