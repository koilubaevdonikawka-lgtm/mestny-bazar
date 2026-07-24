/** Registered AI policy — generic policy metadata only, no domain knowledge. */
export interface Policy {
  readonly policyId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterPolicyInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdatePolicyInput {
  readonly policyId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListPoliciesResult {
  readonly policies: readonly Policy[];
  readonly total: number;
}

export interface FindPolicyByNameResult {
  readonly policy: Policy | null;
}

export interface ListPoliciesByCategoryResult {
  readonly policies: readonly Policy[];
  readonly total: number;
  readonly category: string;
}

export interface DeletePolicyResult {
  readonly policyId: string;
  readonly deleted: boolean;
}

export interface PolicyRegistryStatistics {
  readonly totalPolicies: number;
  readonly activePolicies: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createPolicy(input: {
  policyId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Policy {
  const now = new Date().toISOString();
  return Object.freeze({
    policyId: input.policyId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
