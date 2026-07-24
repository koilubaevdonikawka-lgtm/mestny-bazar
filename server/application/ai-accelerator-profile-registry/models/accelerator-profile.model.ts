/** Registered AI accelerator profile — generic accelerator profile metadata only, no domain knowledge. */
export interface AcceleratorProfile {
  readonly acceleratorProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterAcceleratorProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateAcceleratorProfileInput {
  readonly acceleratorProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListAcceleratorProfilesResult {
  readonly acceleratorProfiles: readonly AcceleratorProfile[];
  readonly total: number;
}

export interface FindAcceleratorProfileByNameResult {
  readonly acceleratorProfile: AcceleratorProfile | null;
}

export interface ListAcceleratorProfilesByCategoryResult {
  readonly acceleratorProfiles: readonly AcceleratorProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteAcceleratorProfileResult {
  readonly acceleratorProfileId: string;
  readonly deleted: boolean;
}

export interface AcceleratorProfileRegistryStatistics {
  readonly totalAcceleratorProfiles: number;
  readonly activeAcceleratorProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createAcceleratorProfile(input: {
  acceleratorProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): AcceleratorProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    acceleratorProfileId: input.acceleratorProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
