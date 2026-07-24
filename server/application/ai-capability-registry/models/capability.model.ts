/** Registered AI capability — generic capability metadata only, no domain knowledge. */
export interface Capability {
  readonly capabilityId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterCapabilityInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateCapabilityInput {
  readonly capabilityId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly status?: "active" | "inactive";
}

export interface ListCapabilitiesResult {
  readonly capabilities: readonly Capability[];
  readonly total: number;
}

export interface FindCapabilityByNameResult {
  readonly capability: Capability | null;
}

export interface ListCapabilitiesByCategoryResult {
  readonly capabilities: readonly Capability[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteCapabilityResult {
  readonly capabilityId: string;
  readonly deleted: boolean;
}

export interface CapabilityRegistryStatistics {
  readonly totalCapabilities: number;
  readonly activeCapabilities: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createCapability(input: {
  capabilityId: string;
  name: string;
  category: string;
  description?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Capability {
  const now = new Date().toISOString();
  return Object.freeze({
    capabilityId: input.capabilityId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
