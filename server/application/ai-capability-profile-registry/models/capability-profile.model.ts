/** Registered AI capability profile — generic capability profile metadata only, no domain knowledge. */
export interface CapabilityProfile {
  readonly capabilityProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterCapabilityProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateCapabilityProfileInput {
  readonly capabilityProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListCapabilityProfilesResult {
  readonly capabilityProfiles: readonly CapabilityProfile[];
  readonly total: number;
}

export interface FindCapabilityProfileByNameResult {
  readonly capabilityProfile: CapabilityProfile | null;
}

export interface ListCapabilityProfilesByCategoryResult {
  readonly capabilityProfiles: readonly CapabilityProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteCapabilityProfileResult {
  readonly capabilityProfileId: string;
  readonly deleted: boolean;
}

export interface CapabilityProfileRegistryStatistics {
  readonly totalCapabilityProfiles: number;
  readonly activeCapabilityProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createCapabilityProfile(input: {
  capabilityProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): CapabilityProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    capabilityProfileId: input.capabilityProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
