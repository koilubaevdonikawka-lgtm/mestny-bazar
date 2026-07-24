/** Registered AI storage profile — generic storage profile metadata only, no domain knowledge. */
export interface StorageProfile {
  readonly storageProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterStorageProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateStorageProfileInput {
  readonly storageProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListStorageProfilesResult {
  readonly storageProfiles: readonly StorageProfile[];
  readonly total: number;
}

export interface FindStorageProfileByNameResult {
  readonly storageProfile: StorageProfile | null;
}

export interface ListStorageProfilesByCategoryResult {
  readonly storageProfiles: readonly StorageProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteStorageProfileResult {
  readonly storageProfileId: string;
  readonly deleted: boolean;
}

export interface StorageProfileRegistryStatistics {
  readonly totalStorageProfiles: number;
  readonly activeStorageProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createStorageProfile(input: {
  storageProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): StorageProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    storageProfileId: input.storageProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
