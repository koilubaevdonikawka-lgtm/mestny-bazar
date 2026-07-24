/** Registered AI safety rule — generic safety rule metadata only, no domain knowledge. */
export interface SafetyRule {
  readonly safetyRuleId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterSafetyRuleInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateSafetyRuleInput {
  readonly safetyRuleId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListSafetyRulesResult {
  readonly safetyRules: readonly SafetyRule[];
  readonly total: number;
}

export interface FindSafetyRuleByNameResult {
  readonly safetyRule: SafetyRule | null;
}

export interface ListSafetyRulesByCategoryResult {
  readonly safetyRules: readonly SafetyRule[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteSafetyRuleResult {
  readonly safetyRuleId: string;
  readonly deleted: boolean;
}

export interface SafetyRuleRegistryStatistics {
  readonly totalSafetyRules: number;
  readonly activeSafetyRules: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createSafetyRule(input: {
  safetyRuleId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): SafetyRule {
  const now = new Date().toISOString();
  return Object.freeze({
    safetyRuleId: input.safetyRuleId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
