/** Registered AI service profile — generic service profile metadata only, no domain knowledge. */
export interface ServiceProfile {
  readonly serviceProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterServiceProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateServiceProfileInput {
  readonly serviceProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListServiceProfilesResult {
  readonly serviceProfiles: readonly ServiceProfile[];
  readonly total: number;
}

export interface FindServiceProfileByNameResult {
  readonly serviceProfile: ServiceProfile | null;
}

export interface ListServiceProfilesByCategoryResult {
  readonly serviceProfiles: readonly ServiceProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteServiceProfileResult {
  readonly serviceProfileId: string;
  readonly deleted: boolean;
}

export interface ServiceProfileRegistryStatistics {
  readonly totalServiceProfiles: number;
  readonly activeServiceProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createServiceProfile(input: {
  serviceProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ServiceProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    serviceProfileId: input.serviceProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
