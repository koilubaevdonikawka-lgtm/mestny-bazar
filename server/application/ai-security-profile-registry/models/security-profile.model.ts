/** Registered AI security profile — generic security profile metadata only, no domain knowledge. */
export interface SecurityProfile {
  readonly securityProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterSecurityProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateSecurityProfileInput {
  readonly securityProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListSecurityProfilesResult {
  readonly securityProfiles: readonly SecurityProfile[];
  readonly total: number;
}

export interface FindSecurityProfileByNameResult {
  readonly securityProfile: SecurityProfile | null;
}

export interface ListSecurityProfilesByCategoryResult {
  readonly securityProfiles: readonly SecurityProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteSecurityProfileResult {
  readonly securityProfileId: string;
  readonly deleted: boolean;
}

export interface SecurityProfileRegistryStatistics {
  readonly totalSecurityProfiles: number;
  readonly activeSecurityProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createSecurityProfile(input: {
  securityProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): SecurityProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    securityProfileId: input.securityProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
