import type { IRateLimitCounter } from "@server/application/rate-limiting-management/contracts/rate-limit-counter.contract";
import type { IRateLimitRepository } from "@server/application/rate-limiting-management/contracts/rate-limit-repository.contract";
import {
  buildCounterStorageKey,
  createRateLimitCounterState,
  normalizeCounterKey,
  type RateLimitCounterState,
} from "@server/application/rate-limiting-management/models/rate-limit.model";

/** In-memory rate limit counter store. */
export class InMemoryRateLimitCounter implements IRateLimitCounter {
  private readonly counters = new Map<string, RateLimitCounterState>();

  constructor(private readonly ruleRepository: IRateLimitRepository) {}

  async getCounter(ruleId: string, counterKey?: string): Promise<RateLimitCounterState> {
    const normalizedRuleId = ruleId.trim();
    const normalizedCounterKey = normalizeCounterKey(counterKey);
    const storageKey = buildCounterStorageKey(normalizedRuleId, normalizedCounterKey);
    const existing = this.counters.get(storageKey);

    if (!existing) {
      return createRateLimitCounterState({
        ruleId: normalizedRuleId,
        counterKey: normalizedCounterKey,
        count: 0,
      });
    }

    const rule = await this.ruleRepository.findById(normalizedRuleId);
    if (!rule) {
      return existing;
    }

    const windowExpired =
      Date.now() - Date.parse(existing.windowStart) >= rule.windowSeconds * 1000;
    if (!windowExpired) {
      return existing;
    }

    const resetCounter = createRateLimitCounterState({
      ruleId: normalizedRuleId,
      counterKey: normalizedCounterKey,
      count: 0,
    });
    this.counters.set(storageKey, resetCounter);
    return resetCounter;
  }

  async increment(ruleId: string, counterKey?: string): Promise<RateLimitCounterState> {
    const current = await this.getCounter(ruleId, counterKey);
    const updated = createRateLimitCounterState({
      ruleId: current.ruleId,
      counterKey: current.counterKey,
      count: current.count + 1,
      windowStart: current.windowStart,
      lastIncrementAt: new Date().toISOString(),
    });

    this.counters.set(buildCounterStorageKey(updated.ruleId, updated.counterKey), updated);
    return updated;
  }

  async reset(ruleId: string, counterKey?: string): Promise<void> {
    const storageKey = buildCounterStorageKey(ruleId, counterKey);
    this.counters.delete(storageKey);
  }

  async findAll(): Promise<readonly RateLimitCounterState[]> {
    return Object.freeze([...this.counters.values()]);
  }
}
