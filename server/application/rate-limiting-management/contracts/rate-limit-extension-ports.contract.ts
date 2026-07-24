/**
 * Future integration ports for Rate Limiting Management.
 * Not implemented — reserved for external rate limiters.
 */

import type {
  CheckRateLimitResult,
  RateLimitRule,
} from "@server/application/rate-limiting-management/models/rate-limit.model";

/** Redis Rate Limiter — Redis integration. */
export interface IRedisRateLimiter {
  checkLimit(ruleId: string, counterKey: string): Promise<CheckRateLimitResult>;
  incrementCounter(ruleId: string, counterKey: string): Promise<number>;
}

/** Envoy Rate Limit Provider — Envoy integration. */
export interface IEnvoyRateLimitProvider {
  shouldRateLimit(rule: RateLimitRule, counterKey: string): Promise<boolean>;
}

/** NGINX Rate Limit Provider — NGINX integration. */
export interface INGINXRateLimitProvider {
  checkLimit(zone: string, counterKey: string): Promise<boolean>;
}

/** API Gateway Rate Limiter — gateway integration. */
export interface IApiGatewayRateLimiter {
  evaluateRequest(ruleId: string, counterKey: string): Promise<CheckRateLimitResult>;
}

/** Distributed Rate Limit Provider — cluster-wide rate limiting. */
export interface IDistributedRateLimitProvider {
  syncCounter(ruleId: string, counterKey: string, count: number): Promise<void>;
  fetchCounter(ruleId: string, counterKey: string): Promise<number>;
}
