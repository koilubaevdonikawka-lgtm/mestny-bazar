/** Registered AI safety profile — generic safety profile metadata only, no domain knowledge. */
export interface SafetyProfile {
  readonly safetyProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterSafetyProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateSafetyProfileInput {
  readonly safetyProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListSafetyProfilesResult {
  readonly safetyProfiles: readonly SafetyProfile[];
  readonly total: number;
}

export interface FindSafetyProfileByNameResult {
  readonly safetyProfile: SafetyProfile | null;
}

export interface ListSafetyProfilesByCategoryResult {
  readonly safetyProfiles: readonly SafetyProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteSafetyProfileResult {
  readonly safetyProfileId: string;
  readonly deleted: boolean;
}

export interface SafetyProfileRegistryStatistics {
  readonly totalSafetyProfiles: number;
  readonly activeSafetyProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createSafetyProfile(input: {
  safetyProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): SafetyProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    safetyProfileId: input.safetyProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
