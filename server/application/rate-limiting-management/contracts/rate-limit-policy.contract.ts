import type {
  RateLimitRule,
  RegisterRateLimitRuleInput,
} from "@server/application/rate-limiting-management/models/rate-limit.model";

export interface IRateLimitPolicy {
  validateRegistration(input: RegisterRateLimitRuleInput): void;
  shouldAllow(rule: RateLimitRule, currentCount: number): boolean;
}
