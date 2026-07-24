import type {
  DeleteRuleResult,
  FindRuleByNameResult,
  ListRulesByCategoryResult,
  ListRulesResult,
  RegisterRuleInput,
  Rule,
  RuleRegistryStatistics,
  UpdateRuleInput,
} from "@server/application/ai-rule-registry/models/rule.model";
import type { AiRuleRegistryService } from "@server/application/ai-rule-registry/services/ai-rule-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterRuleUseCase {
  constructor(private readonly ruleRegistry: AiRuleRegistryService) {}

  execute(input: RegisterRuleInput): Promise<UseCaseResult<Rule>> {
    return this.ruleRegistry.registerRule(input).then(useCaseResult);
  }
}

export class GetRuleUseCase {
  constructor(private readonly ruleRegistry: AiRuleRegistryService) {}

  execute(ruleId: string): Promise<UseCaseResult<Rule | null>> {
    return this.ruleRegistry.getRule(ruleId).then(useCaseResult);
  }
}

export class ListRulesUseCase {
  constructor(private readonly ruleRegistry: AiRuleRegistryService) {}

  execute(): Promise<UseCaseResult<ListRulesResult>> {
    return this.ruleRegistry.listRules().then(useCaseResult);
  }
}

export class UpdateRuleUseCase {
  constructor(private readonly ruleRegistry: AiRuleRegistryService) {}

  execute(input: UpdateRuleInput): Promise<UseCaseResult<Rule>> {
    return this.ruleRegistry.updateRule(input).then(useCaseResult);
  }
}

export class DeleteRuleUseCase {
  constructor(private readonly ruleRegistry: AiRuleRegistryService) {}

  execute(ruleId: string): Promise<UseCaseResult<DeleteRuleResult>> {
    return this.ruleRegistry.deleteRule(ruleId).then(useCaseResult);
  }
}

export class FindRuleByNameUseCase {
  constructor(private readonly ruleRegistry: AiRuleRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindRuleByNameResult>> {
    return this.ruleRegistry.findRuleByName(name).then(useCaseResult);
  }
}

export class ListRulesByCategoryUseCase {
  constructor(private readonly ruleRegistry: AiRuleRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListRulesByCategoryResult>> {
    return this.ruleRegistry.listRulesByCategory(category).then(useCaseResult);
  }
}

export class GetRuleRegistryStatisticsUseCase {
  constructor(private readonly ruleRegistry: AiRuleRegistryService) {}

  execute(): Promise<UseCaseResult<RuleRegistryStatistics>> {
    return this.ruleRegistry.getRuleRegistryStatistics().then(useCaseResult);
  }
}
