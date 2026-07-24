/** Registered AI validation profile — generic validation profile metadata only, no domain knowledge. */
export interface ValidationProfile {
  readonly validationProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterValidationProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateValidationProfileInput {
  readonly validationProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListValidationProfilesResult {
  readonly validationProfiles: readonly ValidationProfile[];
  readonly total: number;
}

export interface FindValidationProfileByNameResult {
  readonly validationProfile: ValidationProfile | null;
}

export interface ListValidationProfilesByCategoryResult {
  readonly validationProfiles: readonly ValidationProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteValidationProfileResult {
  readonly validationProfileId: string;
  readonly deleted: boolean;
}

export interface ValidationProfileRegistryStatistics {
  readonly totalValidationProfiles: number;
  readonly activeValidationProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createValidationProfile(input: {
  validationProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ValidationProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    validationProfileId: input.validationProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
