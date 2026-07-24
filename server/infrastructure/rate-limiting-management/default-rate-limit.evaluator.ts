import type {
  IRateLimitEvaluator,
  RateLimitEvaluation,
} from "@server/application/rate-limiting-management/contracts/rate-limit-evaluator.contract";
import type { RateLimitRule } from "@server/application/rate-limiting-management/models/rate-limit.model";

/** Default rate limit evaluator — fixed window evaluation. */
export class DefaultRateLimitEvaluator implements IRateLimitEvaluator {
  evaluate(rule: RateLimitRule, currentCount: number, windowStart: string): RateLimitEvaluation {
    const windowStartMs = Date.parse(windowStart);
    const resetAt = new Date(windowStartMs + rule.windowSeconds * 1000).toISOString();
    const allowed = currentCount < rule.maxRequests;
    const remaining = Math.max(rule.maxRequests - currentCount, 0);

    return Object.freeze({
      allowed,
      remaining,
      resetAt,
    });
  }
}
