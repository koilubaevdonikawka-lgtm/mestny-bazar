/** Registered AI runtime profile — generic runtime profile metadata only, no domain knowledge. */
export interface RuntimeProfile {
  readonly runtimeProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterRuntimeProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateRuntimeProfileInput {
  readonly runtimeProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListRuntimeProfilesResult {
  readonly runtimeProfiles: readonly RuntimeProfile[];
  readonly total: number;
}

export interface FindRuntimeProfileByNameResult {
  readonly runtimeProfile: RuntimeProfile | null;
}

export interface ListRuntimeProfilesByCategoryResult {
  readonly runtimeProfiles: readonly RuntimeProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteRuntimeProfileResult {
  readonly runtimeProfileId: string;
  readonly deleted: boolean;
}

export interface RuntimeProfileRegistryStatistics {
  readonly totalRuntimeProfiles: number;
  readonly activeRuntimeProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createRuntimeProfile(input: {
  runtimeProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): RuntimeProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    runtimeProfileId: input.runtimeProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
