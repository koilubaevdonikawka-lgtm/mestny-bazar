/** Registered AI resource profile — generic resource profile metadata only, no domain knowledge. */
export interface ResourceProfile {
  readonly resourceProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterResourceProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateResourceProfileInput {
  readonly resourceProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListResourceProfilesResult {
  readonly resourceProfiles: readonly ResourceProfile[];
  readonly total: number;
}

export interface FindResourceProfileByNameResult {
  readonly resourceProfile: ResourceProfile | null;
}

export interface ListResourceProfilesByCategoryResult {
  readonly resourceProfiles: readonly ResourceProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteResourceProfileResult {
  readonly resourceProfileId: string;
  readonly deleted: boolean;
}

export interface ResourceProfileRegistryStatistics {
  readonly totalResourceProfiles: number;
  readonly activeResourceProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createResourceProfile(input: {
  resourceProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ResourceProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    resourceProfileId: input.resourceProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
