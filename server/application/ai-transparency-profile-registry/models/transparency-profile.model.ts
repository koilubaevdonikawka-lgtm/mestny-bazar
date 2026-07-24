/** Registered AI transparency profile — generic transparency profile metadata only, no domain knowledge. */
export interface TransparencyProfile {
  readonly transparencyProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterTransparencyProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateTransparencyProfileInput {
  readonly transparencyProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListTransparencyProfilesResult {
  readonly transparencyProfiles: readonly TransparencyProfile[];
  readonly total: number;
}

export interface FindTransparencyProfileByNameResult {
  readonly transparencyProfile: TransparencyProfile | null;
}

export interface ListTransparencyProfilesByCategoryResult {
  readonly transparencyProfiles: readonly TransparencyProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteTransparencyProfileResult {
  readonly transparencyProfileId: string;
  readonly deleted: boolean;
}

export interface TransparencyProfileRegistryStatistics {
  readonly totalTransparencyProfiles: number;
  readonly activeTransparencyProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createTransparencyProfile(input: {
  transparencyProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): TransparencyProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    transparencyProfileId: input.transparencyProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
