/** Registered AI rule — generic rule metadata only, no domain knowledge. */
export interface Rule {
  readonly ruleId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterRuleInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateRuleInput {
  readonly ruleId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListRulesResult {
  readonly rules: readonly Rule[];
  readonly total: number;
}

export interface FindRuleByNameResult {
  readonly rule: Rule | null;
}

export interface ListRulesByCategoryResult {
  readonly rules: readonly Rule[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteRuleResult {
  readonly ruleId: string;
  readonly deleted: boolean;
}

export interface RuleRegistryStatistics {
  readonly totalRules: number;
  readonly activeRules: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createRule(input: {
  ruleId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Rule {
  const now = new Date().toISOString();
  return Object.freeze({
    ruleId: input.ruleId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
