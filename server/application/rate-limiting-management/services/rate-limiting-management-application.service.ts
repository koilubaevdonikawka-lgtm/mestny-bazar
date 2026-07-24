import type {
  CheckRateLimitInput,
  IncrementRateLimitInput,
  RegisterRateLimitRuleInput,
  ResetRateLimitInput,
} from "@server/application/rate-limiting-management/models/rate-limit.model";
import {
  CheckRateLimitUseCase,
  DeleteRateLimitRuleUseCase,
  GetRateLimitRuleUseCase,
  GetRateLimitStatisticsUseCase,
  IncrementRateLimitCounterUseCase,
  ListRateLimitRulesUseCase,
  RegisterRateLimitRuleUseCase,
  ResetRateLimitCounterUseCase,
} from "@server/application/rate-limiting-management/use-cases/rate-limiting-management.use-cases";

/** Application facade for rate limiting management scenario. */
export class RateLimitingManagementApplicationService {
  constructor(
    private readonly registerRateLimitRuleUseCase: RegisterRateLimitRuleUseCase,
    private readonly checkRateLimitUseCase: CheckRateLimitUseCase,
    private readonly incrementRateLimitCounterUseCase: IncrementRateLimitCounterUseCase,
    private readonly resetRateLimitCounterUseCase: ResetRateLimitCounterUseCase,
    private readonly deleteRateLimitRuleUseCase: DeleteRateLimitRuleUseCase,
    private readonly getRateLimitRuleUseCase: GetRateLimitRuleUseCase,
    private readonly listRateLimitRulesUseCase: ListRateLimitRulesUseCase,
    private readonly getRateLimitStatisticsUseCase: GetRateLimitStatisticsUseCase,
  ) {}

  registerRateLimitRule(input: RegisterRateLimitRuleInput) {
    return this.registerRateLimitRuleUseCase.execute(input);
  }

  checkRateLimit(input: CheckRateLimitInput) {
    return this.checkRateLimitUseCase.execute(input);
  }

  incrementRateLimitCounter(input: IncrementRateLimitInput) {
    return this.incrementRateLimitCounterUseCase.execute(input);
  }

  resetRateLimitCounter(input: ResetRateLimitInput) {
    return this.resetRateLimitCounterUseCase.execute(input);
  }

  deleteRateLimitRule(ruleId: string) {
    return this.deleteRateLimitRuleUseCase.execute(ruleId);
  }

  getRateLimitRule(ruleId: string) {
    return this.getRateLimitRuleUseCase.execute(ruleId);
  }

  listRateLimitRules() {
    return this.listRateLimitRulesUseCase.execute();
  }

  getRateLimitStatistics() {
    return this.getRateLimitStatisticsUseCase.execute();
  }
}
