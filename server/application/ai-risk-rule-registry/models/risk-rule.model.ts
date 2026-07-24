/** Registered AI risk rule — generic risk rule metadata only, no domain knowledge. */
export interface RiskRule {
  readonly riskRuleId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterRiskRuleInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateRiskRuleInput {
  readonly riskRuleId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListRiskRulesResult {
  readonly riskRules: readonly RiskRule[];
  readonly total: number;
}

export interface FindRiskRuleByNameResult {
  readonly riskRule: RiskRule | null;
}

export interface ListRiskRulesByCategoryResult {
  readonly riskRules: readonly RiskRule[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteRiskRuleResult {
  readonly riskRuleId: string;
  readonly deleted: boolean;
}

export interface RiskRuleRegistryStatistics {
  readonly totalRiskRules: number;
  readonly activeRiskRules: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createRiskRule(input: {
  riskRuleId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): RiskRule {
  const now = new Date().toISOString();
  return Object.freeze({
    riskRuleId: input.riskRuleId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
