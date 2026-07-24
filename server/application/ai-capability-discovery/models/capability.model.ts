/** Registered AI capability — generic metadata only, no domain knowledge. */
export interface AiCapability {
  readonly capabilityId: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly definition: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterCapabilityInput {
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly definition?: unknown;
  readonly status?: "active" | "inactive";
}

export interface UpdateCapabilityInput {
  readonly capabilityId: string;
  readonly name?: string;
  readonly description?: string;
  readonly category?: string;
  readonly definition?: unknown;
  readonly status?: "active" | "inactive";
}

export interface ListCapabilitiesResult {
  readonly capabilities: readonly AiCapability[];
  readonly total: number;
}

export interface FindCapabilityByNameResult {
  readonly name: string;
  readonly capability: AiCapability | null;
}

export interface ListCapabilitiesByCategoryResult {
  readonly category: string;
  readonly capabilities: readonly AiCapability[];
  readonly total: number;
}

export interface DeleteCapabilityResult {
  readonly capabilityId: string;
  readonly deleted: boolean;
}

export interface CapabilityStatistics {
  readonly totalCapabilities: number;
  readonly totalCategories: number;
  readonly activeCapabilities: number;
  readonly inactiveCapabilities: number;
}

export function normalizeCapabilityCategory(category?: string): string {
  return (category ?? "general").trim() || "general";
}

export function createAiCapability(input: {
  capabilityId: string;
  name: string;
  description?: string;
  category?: string;
  definition?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): AiCapability {
  const now = new Date().toISOString();
  return Object.freeze({
    capabilityId: input.capabilityId,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    category: normalizeCapabilityCategory(input.category),
    definition: input.definition ?? Object.freeze({}),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
