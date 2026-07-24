/** Registered AI deployment profile — generic deployment profile metadata only, no domain knowledge. */
export interface DeploymentProfile {
  readonly deploymentProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterDeploymentProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateDeploymentProfileInput {
  readonly deploymentProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListDeploymentProfilesResult {
  readonly deploymentProfiles: readonly DeploymentProfile[];
  readonly total: number;
}

export interface FindDeploymentProfileByNameResult {
  readonly deploymentProfile: DeploymentProfile | null;
}

export interface ListDeploymentProfilesByCategoryResult {
  readonly deploymentProfiles: readonly DeploymentProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteDeploymentProfileResult {
  readonly deploymentProfileId: string;
  readonly deleted: boolean;
}

export interface DeploymentProfileRegistryStatistics {
  readonly totalDeploymentProfiles: number;
  readonly activeDeploymentProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createDeploymentProfile(input: {
  deploymentProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): DeploymentProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    deploymentProfileId: input.deploymentProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
