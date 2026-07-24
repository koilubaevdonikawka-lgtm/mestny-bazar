/** Registered AI audit profile — generic audit profile metadata only, no domain knowledge. */
export interface AuditProfile {
  readonly auditProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterAuditProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateAuditProfileInput {
  readonly auditProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListAuditProfilesResult {
  readonly auditProfiles: readonly AuditProfile[];
  readonly total: number;
}

export interface FindAuditProfileByNameResult {
  readonly auditProfile: AuditProfile | null;
}

export interface ListAuditProfilesByCategoryResult {
  readonly auditProfiles: readonly AuditProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteAuditProfileResult {
  readonly auditProfileId: string;
  readonly deleted: boolean;
}

export interface AuditProfileRegistryStatistics {
  readonly totalAuditProfiles: number;
  readonly activeAuditProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createAuditProfile(input: {
  auditProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): AuditProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    auditProfileId: input.auditProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
