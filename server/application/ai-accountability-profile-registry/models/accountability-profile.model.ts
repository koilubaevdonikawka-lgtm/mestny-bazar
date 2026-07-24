/** Registered AI accountability profile — generic accountability profile metadata only, no domain knowledge. */
export interface AccountabilityProfile {
  readonly accountabilityProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterAccountabilityProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateAccountabilityProfileInput {
  readonly accountabilityProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListAccountabilityProfilesResult {
  readonly accountabilityProfiles: readonly AccountabilityProfile[];
  readonly total: number;
}

export interface FindAccountabilityProfileByNameResult {
  readonly accountabilityProfile: AccountabilityProfile | null;
}

export interface ListAccountabilityProfilesByCategoryResult {
  readonly accountabilityProfiles: readonly AccountabilityProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteAccountabilityProfileResult {
  readonly accountabilityProfileId: string;
  readonly deleted: boolean;
}

export interface AccountabilityProfileRegistryStatistics {
  readonly totalAccountabilityProfiles: number;
  readonly activeAccountabilityProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createAccountabilityProfile(input: {
  accountabilityProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): AccountabilityProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    accountabilityProfileId: input.accountabilityProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
