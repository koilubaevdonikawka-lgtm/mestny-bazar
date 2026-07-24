/** Registered AI policy set — generic policy set metadata only, no domain knowledge. */
export interface PolicySet {
  readonly policySetId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterPolicySetInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdatePolicySetInput {
  readonly policySetId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListPolicySetsResult {
  readonly policySets: readonly PolicySet[];
  readonly total: number;
}

export interface FindPolicySetByNameResult {
  readonly policySet: PolicySet | null;
}

export interface ListPolicySetsByCategoryResult {
  readonly policySets: readonly PolicySet[];
  readonly total: number;
  readonly category: string;
}

export interface DeletePolicySetResult {
  readonly policySetId: string;
  readonly deleted: boolean;
}

export interface PolicySetRegistryStatistics {
  readonly totalPolicySets: number;
  readonly activePolicySets: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createPolicySet(input: {
  policySetId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): PolicySet {
  const now = new Date().toISOString();
  return Object.freeze({
    policySetId: input.policySetId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
