/**
 * Rate Limiting Management — request limit registration and checking only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IRateLimitCounter } from "@server/application/rate-limiting-management/contracts/rate-limit-counter.contract";
import type { IRateLimitEvaluator } from "@server/application/rate-limiting-management/contracts/rate-limit-evaluator.contract";
import type { IRateLimitPolicy } from "@server/application/rate-limiting-management/contracts/rate-limit-policy.contract";
import type { IRateLimitRepository } from "@server/application/rate-limiting-management/contracts/rate-limit-repository.contract";
import type { IRateLimitStatisticsProvider } from "@server/application/rate-limiting-management/contracts/rate-limit-statistics-provider.contract";
import {
  createRateLimitRule,
  normalizeCounterKey,
  type CheckRateLimitInput,
  type CheckRateLimitResult,
  type IncrementRateLimitInput,
  type ListRateLimitRulesResult,
  type RateLimitCounterState,
  type RateLimitRule,
  type RateLimitStatistics,
  type RegisterRateLimitRuleInput,
  type ResetRateLimitInput,
} from "@server/application/rate-limiting-management/models/rate-limit.model";
import type { IIdGenerator } from "@server/application/ports";

export class RateLimitingManagementService {
  constructor(
    private readonly rateLimitRepository: IRateLimitRepository,
    private readonly rateLimitEvaluator: IRateLimitEvaluator,
    private readonly rateLimitCounter: IRateLimitCounter,
    private readonly rateLimitPolicy: IRateLimitPolicy,
    private readonly statisticsProvider: IRateLimitStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerRateLimitRule(input: RegisterRateLimitRuleInput): Promise<RateLimitRule> {
    this.rateLimitPolicy.validateRegistration(input);

    const key = input.key.trim();
    if (await this.rateLimitRepository.findByKey(key)) {
      throw new Error(`Rate limit rule already exists for key: ${key}`);
    }

    const rule = createRateLimitRule({
      ruleId: this.idGenerator.generate(),
      name: input.name,
      key,
      maxRequests: input.maxRequests,
      windowSeconds: input.windowSeconds,
      description: input.description,
    });

    await this.rateLimitRepository.save(rule);
    return rule;
  }

  async checkRateLimit(input: CheckRateLimitInput): Promise<CheckRateLimitResult> {
    const rule = await this.requireRule(input.ruleId);
    const counterKey = normalizeCounterKey(input.counterKey);
    const counter = await this.rateLimitCounter.getCounter(rule.ruleId, counterKey);
    const evaluation = this.rateLimitEvaluator.evaluate(rule, counter.count, counter.windowStart);

    await this.statisticsProvider.recordCheck(rule.ruleId, evaluation.allowed);

    return Object.freeze({
      ruleId: rule.ruleId,
      counterKey,
      allowed: evaluation.allowed,
      currentCount: counter.count,
      maxRequests: rule.maxRequests,
      remaining: evaluation.remaining,
      resetAt: evaluation.resetAt,
    });
  }

  async incrementRateLimitCounter(input: IncrementRateLimitInput): Promise<RateLimitCounterState> {
    const rule = await this.requireRule(input.ruleId);
    const counterKey = normalizeCounterKey(input.counterKey);
    const counter = await this.rateLimitCounter.increment(rule.ruleId, counterKey);
    return counter;
  }

  async resetRateLimitCounter(input: ResetRateLimitInput): Promise<{ ruleId: string; counterKey: string; reset: boolean }> {
    const rule = await this.requireRule(input.ruleId);
    const counterKey = normalizeCounterKey(input.counterKey);
    await this.rateLimitCounter.reset(rule.ruleId, counterKey);
    return Object.freeze({ ruleId: rule.ruleId, counterKey, reset: true });
  }

  async deleteRateLimitRule(ruleId: string): Promise<{ ruleId: string; deleted: boolean }> {
    const normalizedRuleId = ruleId.trim();
    if (!(await this.rateLimitRepository.findById(normalizedRuleId))) {
      throw new Error(`Rate limit rule not found: ${normalizedRuleId}`);
    }

    await this.rateLimitRepository.delete(normalizedRuleId);
    return Object.freeze({ ruleId: normalizedRuleId, deleted: true });
  }

  async getRateLimitRule(ruleId: string): Promise<RateLimitRule | null> {
    return this.rateLimitRepository.findById(ruleId.trim());
  }

  async listRateLimitRules(): Promise<ListRateLimitRulesResult> {
    const rules = Object.freeze(
      [...(await this.rateLimitRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );

    return Object.freeze({
      rules,
      total: rules.length,
    });
  }

  async getRateLimitStatistics(): Promise<RateLimitStatistics> {
    const rules = await this.rateLimitRepository.findAll();
    const counters = await this.rateLimitCounter.findAll();
    const counterStats = counters.map((counter) => {
      const rule = rules.find((entry) => entry.ruleId === counter.ruleId);
      return Object.freeze({
        ruleId: counter.ruleId,
        counterKey: counter.counterKey,
        count: counter.count,
        maxRequests: rule?.maxRequests ?? 0,
      });
    });

    return this.statisticsProvider.getStatistics(rules.length, counterStats);
  }

  private async requireRule(ruleId: string): Promise<RateLimitRule> {
    const rule = await this.rateLimitRepository.findById(ruleId.trim());
    if (!rule) {
      throw new Error(`Rate limit rule not found: ${ruleId.trim()}`);
    }
    return rule;
  }
}
