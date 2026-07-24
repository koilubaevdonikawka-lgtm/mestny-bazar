/** Registered AI memory profile — generic memory profile metadata only, no domain knowledge. */
export interface MemoryProfile {
  readonly memoryProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterMemoryProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateMemoryProfileInput {
  readonly memoryProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListMemoryProfilesResult {
  readonly memoryProfiles: readonly MemoryProfile[];
  readonly total: number;
}

export interface FindMemoryProfileByNameResult {
  readonly memoryProfile: MemoryProfile | null;
}

export interface ListMemoryProfilesByCategoryResult {
  readonly memoryProfiles: readonly MemoryProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteMemoryProfileResult {
  readonly memoryProfileId: string;
  readonly deleted: boolean;
}

export interface MemoryProfileRegistryStatistics {
  readonly totalMemoryProfiles: number;
  readonly activeMemoryProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createMemoryProfile(input: {
  memoryProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): MemoryProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    memoryProfileId: input.memoryProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
