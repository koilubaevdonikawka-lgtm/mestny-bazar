import type { RateLimitRule } from "@server/application/rate-limiting-management/models/rate-limit.model";

export interface IRateLimitRepository {
  save(rule: RateLimitRule): Promise<void>;
  findById(ruleId: string): Promise<RateLimitRule | null>;
  findByKey(key: string): Promise<RateLimitRule | null>;
  delete(ruleId: string): Promise<void>;
  findAll(): Promise<readonly RateLimitRule[]>;
}
