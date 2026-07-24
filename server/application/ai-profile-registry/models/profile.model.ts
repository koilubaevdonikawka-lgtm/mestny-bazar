/** Registered AI profile — generic profile metadata only, no domain knowledge. */
export interface Profile {
  readonly profileId: string;
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly configuration: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterProfileInput {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly configuration?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateProfileInput {
  readonly profileId: string;
  readonly name?: string;
  readonly type?: string;
  readonly description?: string;
  readonly configuration?: string;
  readonly status?: "active" | "inactive";
}

export interface ListProfilesResult {
  readonly profiles: readonly Profile[];
  readonly total: number;
}

export interface FindProfileByNameResult {
  readonly profile: Profile | null;
}

export interface ListProfilesByTypeResult {
  readonly profiles: readonly Profile[];
  readonly total: number;
  readonly type: string;
}

export interface DeleteProfileResult {
  readonly profileId: string;
  readonly deleted: boolean;
}

export interface ProfileRegistryStatistics {
  readonly totalProfiles: number;
  readonly activeProfiles: number;
  readonly typeCount: number;
  readonly types: readonly string[];
}

export function createProfile(input: {
  profileId: string;
  name: string;
  type: string;
  description?: string;
  configuration?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Profile {
  const now = new Date().toISOString();
  return Object.freeze({
    profileId: input.profileId,
    name: input.name.trim(),
    type: input.type.trim(),
    description: (input.description ?? "").trim(),
    configuration: (input.configuration ?? "{}").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
