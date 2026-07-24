/** Registered AI environment profile — generic environment profile metadata only, no domain knowledge. */
export interface EnvironmentProfile {
  readonly environmentProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterEnvironmentProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateEnvironmentProfileInput {
  readonly environmentProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListEnvironmentProfilesResult {
  readonly environmentProfiles: readonly EnvironmentProfile[];
  readonly total: number;
}

export interface FindEnvironmentProfileByNameResult {
  readonly environmentProfile: EnvironmentProfile | null;
}

export interface ListEnvironmentProfilesByCategoryResult {
  readonly environmentProfiles: readonly EnvironmentProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteEnvironmentProfileResult {
  readonly environmentProfileId: string;
  readonly deleted: boolean;
}

export interface EnvironmentProfileRegistryStatistics {
  readonly totalEnvironmentProfiles: number;
  readonly activeEnvironmentProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createEnvironmentProfile(input: {
  environmentProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): EnvironmentProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    environmentProfileId: input.environmentProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
