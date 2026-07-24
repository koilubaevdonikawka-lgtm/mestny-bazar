/** Registered AI privacy profile — generic privacy profile metadata only, no domain knowledge. */
export interface PrivacyProfile {
  readonly privacyProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterPrivacyProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdatePrivacyProfileInput {
  readonly privacyProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListPrivacyProfilesResult {
  readonly privacyProfiles: readonly PrivacyProfile[];
  readonly total: number;
}

export interface FindPrivacyProfileByNameResult {
  readonly privacyProfile: PrivacyProfile | null;
}

export interface ListPrivacyProfilesByCategoryResult {
  readonly privacyProfiles: readonly PrivacyProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeletePrivacyProfileResult {
  readonly privacyProfileId: string;
  readonly deleted: boolean;
}

export interface PrivacyProfileRegistryStatistics {
  readonly totalPrivacyProfiles: number;
  readonly activePrivacyProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createPrivacyProfile(input: {
  privacyProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): PrivacyProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    privacyProfileId: input.privacyProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
