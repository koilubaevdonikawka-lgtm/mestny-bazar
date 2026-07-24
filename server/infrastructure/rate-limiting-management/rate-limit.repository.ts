import type { IRateLimitRepository } from "@server/application/rate-limiting-management/contracts/rate-limit-repository.contract";
import type { RateLimitRule } from "@server/application/rate-limiting-management/models/rate-limit.model";

/** In-memory rate limit rule store. */
export class RateLimitRepository implements IRateLimitRepository {
  private readonly rules = new Map<string, RateLimitRule>();
  private readonly rulesByKey = new Map<string, string>();

  async save(rule: RateLimitRule): Promise<void> {
    this.rules.set(rule.ruleId, rule);
    this.rulesByKey.set(rule.key, rule.ruleId);
  }

  async findById(ruleId: string): Promise<RateLimitRule | null> {
    return this.rules.get(ruleId.trim()) ?? null;
  }

  async findByKey(key: string): Promise<RateLimitRule | null> {
    const ruleId = this.rulesByKey.get(key.trim());
    if (!ruleId) {
      return null;
    }
    return this.findById(ruleId);
  }

  async delete(ruleId: string): Promise<void> {
    const rule = await this.findById(ruleId);
    if (!rule) {
      return;
    }
    this.rules.delete(rule.ruleId);
    this.rulesByKey.delete(rule.key);
  }

  async findAll(): Promise<readonly RateLimitRule[]> {
    return Object.freeze([...this.rules.values()]);
  }
}
