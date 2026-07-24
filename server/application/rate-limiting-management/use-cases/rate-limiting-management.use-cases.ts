import type {
  CheckRateLimitInput,
  CheckRateLimitResult,
  IncrementRateLimitInput,
  ListRateLimitRulesResult,
  RateLimitCounterState,
  RateLimitRule,
  RateLimitStatistics,
  RegisterRateLimitRuleInput,
  ResetRateLimitInput,
} from "@server/application/rate-limiting-management/models/rate-limit.model";
import type { RateLimitingManagementService } from "@server/application/rate-limiting-management/services/rate-limiting-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterRateLimitRuleUseCase {
  constructor(private readonly rateLimits: RateLimitingManagementService) {}

  execute(input: RegisterRateLimitRuleInput): Promise<UseCaseResult<RateLimitRule>> {
    return this.rateLimits.registerRateLimitRule(input).then(useCaseResult);
  }
}

export class CheckRateLimitUseCase {
  constructor(private readonly rateLimits: RateLimitingManagementService) {}

  execute(input: CheckRateLimitInput): Promise<UseCaseResult<CheckRateLimitResult>> {
    return this.rateLimits.checkRateLimit(input).then(useCaseResult);
  }
}

export class IncrementRateLimitCounterUseCase {
  constructor(private readonly rateLimits: RateLimitingManagementService) {}

  execute(input: IncrementRateLimitInput): Promise<UseCaseResult<RateLimitCounterState>> {
    return this.rateLimits.incrementRateLimitCounter(input).then(useCaseResult);
  }
}

export class ResetRateLimitCounterUseCase {
  constructor(private readonly rateLimits: RateLimitingManagementService) {}

  execute(input: ResetRateLimitInput): Promise<UseCaseResult<{ ruleId: string; counterKey: string; reset: boolean }>> {
    return this.rateLimits.resetRateLimitCounter(input).then(useCaseResult);
  }
}

export class DeleteRateLimitRuleUseCase {
  constructor(private readonly rateLimits: RateLimitingManagementService) {}

  execute(ruleId: string): Promise<UseCaseResult<{ ruleId: string; deleted: boolean }>> {
    return this.rateLimits.deleteRateLimitRule(ruleId).then(useCaseResult);
  }
}

export class GetRateLimitRuleUseCase {
  constructor(private readonly rateLimits: RateLimitingManagementService) {}

  execute(ruleId: string): Promise<UseCaseResult<RateLimitRule | null>> {
    return this.rateLimits.getRateLimitRule(ruleId).then(useCaseResult);
  }
}

export class ListRateLimitRulesUseCase {
  constructor(private readonly rateLimits: RateLimitingManagementService) {}

  execute(): Promise<UseCaseResult<ListRateLimitRulesResult>> {
    return this.rateLimits.listRateLimitRules().then(useCaseResult);
  }
}

export class GetRateLimitStatisticsUseCase {
  constructor(private readonly rateLimits: RateLimitingManagementService) {}

  execute(): Promise<UseCaseResult<RateLimitStatistics>> {
    return this.rateLimits.getRateLimitStatistics().then(useCaseResult);
  }
}
