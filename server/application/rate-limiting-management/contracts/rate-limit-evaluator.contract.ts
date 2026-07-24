import type { RateLimitRule } from "@server/application/rate-limiting-management/models/rate-limit.model";

export interface RateLimitEvaluation {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: string;
}

export interface IRateLimitEvaluator {
  evaluate(rule: RateLimitRule, currentCount: number, windowStart: string): RateLimitEvaluation;
}
