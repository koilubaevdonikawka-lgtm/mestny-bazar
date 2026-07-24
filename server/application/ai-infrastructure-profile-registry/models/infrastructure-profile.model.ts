/** Registered AI infrastructure profile — generic infrastructure profile metadata only, no domain knowledge. */
export interface InfrastructureProfile {
  readonly infrastructureProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterInfrastructureProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateInfrastructureProfileInput {
  readonly infrastructureProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListInfrastructureProfilesResult {
  readonly infrastructureProfiles: readonly InfrastructureProfile[];
  readonly total: number;
}

export interface FindInfrastructureProfileByNameResult {
  readonly infrastructureProfile: InfrastructureProfile | null;
}

export interface ListInfrastructureProfilesByCategoryResult {
  readonly infrastructureProfiles: readonly InfrastructureProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteInfrastructureProfileResult {
  readonly infrastructureProfileId: string;
  readonly deleted: boolean;
}

export interface InfrastructureProfileRegistryStatistics {
  readonly totalInfrastructureProfiles: number;
  readonly activeInfrastructureProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createInfrastructureProfile(input: {
  infrastructureProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): InfrastructureProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    infrastructureProfileId: input.infrastructureProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
