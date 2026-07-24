/** Registered AI governance policy — generic governance policy metadata only, no domain knowledge. */
export interface GovernancePolicy {
  readonly governancePolicyId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterGovernancePolicyInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateGovernancePolicyInput {
  readonly governancePolicyId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListGovernancePoliciesResult {
  readonly governancePolicies: readonly GovernancePolicy[];
  readonly total: number;
}

export interface FindGovernancePolicyByNameResult {
  readonly governancePolicy: GovernancePolicy | null;
}

export interface ListGovernancePoliciesByCategoryResult {
  readonly governancePolicies: readonly GovernancePolicy[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteGovernancePolicyResult {
  readonly governancePolicyId: string;
  readonly deleted: boolean;
}

export interface GovernancePolicyRegistryStatistics {
  readonly totalGovernancePolicies: number;
  readonly activeGovernancePolicies: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createGovernancePolicy(input: {
  governancePolicyId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): GovernancePolicy {
  const now = new Date().toISOString();
  return Object.freeze({
    governancePolicyId: input.governancePolicyId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
