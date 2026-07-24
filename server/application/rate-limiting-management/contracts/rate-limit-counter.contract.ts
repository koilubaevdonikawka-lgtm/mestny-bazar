import type { RateLimitCounterState } from "@server/application/rate-limiting-management/models/rate-limit.model";

export interface IRateLimitCounter {
  getCounter(ruleId: string, counterKey?: string): Promise<RateLimitCounterState>;
  increment(ruleId: string, counterKey?: string): Promise<RateLimitCounterState>;
  reset(ruleId: string, counterKey?: string): Promise<void>;
  findAll(): Promise<readonly RateLimitCounterState[]>;
}
