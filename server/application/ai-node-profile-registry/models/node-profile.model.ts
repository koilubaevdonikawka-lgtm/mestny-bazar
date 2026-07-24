/** Registered AI node profile — generic node profile metadata only, no domain knowledge. */
export interface NodeProfile {
  readonly nodeProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterNodeProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateNodeProfileInput {
  readonly nodeProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListNodeProfilesResult {
  readonly nodeProfiles: readonly NodeProfile[];
  readonly total: number;
}

export interface FindNodeProfileByNameResult {
  readonly nodeProfile: NodeProfile | null;
}

export interface ListNodeProfilesByCategoryResult {
  readonly nodeProfiles: readonly NodeProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteNodeProfileResult {
  readonly nodeProfileId: string;
  readonly deleted: boolean;
}

export interface NodeProfileRegistryStatistics {
  readonly totalNodeProfiles: number;
  readonly activeNodeProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createNodeProfile(input: {
  nodeProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): NodeProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    nodeProfileId: input.nodeProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
