/** Rate limit rule definition — no domain data. */
export interface RateLimitRule {
  readonly ruleId: string;
  readonly name: string;
  readonly key: string;
  readonly maxRequests: number;
  readonly windowSeconds: number;
  readonly description: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RateLimitCounterState {
  readonly ruleId: string;
  readonly counterKey: string;
  readonly count: number;
  readonly windowStart: string;
  readonly lastIncrementAt: string;
}

export interface RegisterRateLimitRuleInput {
  readonly name: string;
  readonly key: string;
  readonly maxRequests: number;
  readonly windowSeconds: number;
  readonly description?: string;
}

export interface CheckRateLimitInput {
  readonly ruleId: string;
  readonly counterKey?: string;
}

export interface CheckRateLimitResult {
  readonly ruleId: string;
  readonly counterKey: string;
  readonly allowed: boolean;
  readonly currentCount: number;
  readonly maxRequests: number;
  readonly remaining: number;
  readonly resetAt: string;
}

export interface IncrementRateLimitInput {
  readonly ruleId: string;
  readonly counterKey?: string;
}

export interface ResetRateLimitInput {
  readonly ruleId: string;
  readonly counterKey?: string;
}

export interface ListRateLimitRulesResult {
  readonly rules: readonly RateLimitRule[];
  readonly total: number;
}

export interface RateLimitStatistics {
  readonly totalRules: number;
  readonly totalChecks: number;
  readonly totalAllowed: number;
  readonly totalDenied: number;
  readonly counters: readonly {
    readonly ruleId: string;
    readonly counterKey: string;
    readonly count: number;
    readonly maxRequests: number;
  }[];
}

export function createRateLimitRule(input: {
  ruleId: string;
  name: string;
  key: string;
  maxRequests: number;
  windowSeconds: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}): RateLimitRule {
  const now = new Date().toISOString();
  return Object.freeze({
    ruleId: input.ruleId.trim(),
    name: input.name.trim(),
    key: input.key.trim(),
    maxRequests: input.maxRequests,
    windowSeconds: input.windowSeconds,
    description: (input.description ?? "").trim(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function createRateLimitCounterState(input: {
  ruleId: string;
  counterKey: string;
  count: number;
  windowStart?: string;
  lastIncrementAt?: string;
}): RateLimitCounterState {
  const now = new Date().toISOString();
  return Object.freeze({
    ruleId: input.ruleId.trim(),
    counterKey: input.counterKey.trim(),
    count: input.count,
    windowStart: input.windowStart ?? now,
    lastIncrementAt: input.lastIncrementAt ?? now,
  });
}

export function normalizeCounterKey(counterKey?: string): string {
  return (counterKey ?? "default").trim() || "default";
}

export function buildCounterStorageKey(ruleId: string, counterKey?: string): string {
  return `${ruleId.trim()}::${normalizeCounterKey(counterKey)}`;
}
