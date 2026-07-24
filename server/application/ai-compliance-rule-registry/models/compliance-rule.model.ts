/** Registered AI compliance rule — generic compliance rule metadata only, no domain knowledge. */
export interface ComplianceRule {
  readonly complianceRuleId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterComplianceRuleInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateComplianceRuleInput {
  readonly complianceRuleId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListComplianceRulesResult {
  readonly complianceRules: readonly ComplianceRule[];
  readonly total: number;
}

export interface FindComplianceRuleByNameResult {
  readonly complianceRule: ComplianceRule | null;
}

export interface ListComplianceRulesByCategoryResult {
  readonly complianceRules: readonly ComplianceRule[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteComplianceRuleResult {
  readonly complianceRuleId: string;
  readonly deleted: boolean;
}

export interface ComplianceRuleRegistryStatistics {
  readonly totalComplianceRules: number;
  readonly activeComplianceRules: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createComplianceRule(input: {
  complianceRuleId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): ComplianceRule {
  const now = new Date().toISOString();
  return Object.freeze({
    complianceRuleId: input.complianceRuleId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
