import type { IRateLimitPolicy } from "@server/application/rate-limiting-management/contracts/rate-limit-policy.contract";
import type {
  RateLimitRule,
  RegisterRateLimitRuleInput,
} from "@server/application/rate-limiting-management/models/rate-limit.model";

/** Default rate limit policy — validation and allow rules. */
export class DefaultRateLimitPolicy implements IRateLimitPolicy {
  validateRegistration(input: RegisterRateLimitRuleInput): void {
    if (!input.name.trim()) {
      throw new Error("Rate limit rule name is required.");
    }
    if (!input.key.trim()) {
      throw new Error("Rate limit rule key is required.");
    }
    if (!Number.isFinite(input.maxRequests) || input.maxRequests <= 0) {
      throw new Error("maxRequests must be a positive number.");
    }
    if (!Number.isFinite(input.windowSeconds) || input.windowSeconds <= 0) {
      throw new Error("windowSeconds must be a positive number.");
    }
  }

  shouldAllow(rule: RateLimitRule, currentCount: number): boolean {
    return currentCount < rule.maxRequests;
  }
}
