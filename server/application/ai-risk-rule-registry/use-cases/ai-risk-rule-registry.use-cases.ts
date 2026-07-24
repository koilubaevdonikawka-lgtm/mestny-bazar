import type {
  DeleteRiskRuleResult,
  FindRiskRuleByNameResult,
  ListRiskRulesByCategoryResult,
  ListRiskRulesResult,
  RegisterRiskRuleInput,
  RiskRule,
  RiskRuleRegistryStatistics,
  UpdateRiskRuleInput,
} from "@server/application/ai-risk-rule-registry/models/risk-rule.model";
import type { AiRiskRuleRegistryService } from "@server/application/ai-risk-rule-registry/services/ai-risk-rule-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterRiskRuleUseCase {
  constructor(private readonly riskRuleRegistry: AiRiskRuleRegistryService) {}

  execute(input: RegisterRiskRuleInput): Promise<UseCaseResult<RiskRule>> {
    return this.riskRuleRegistry.registerRiskRule(input).then(useCaseResult);
  }
}

export class GetRiskRuleUseCase {
  constructor(private readonly riskRuleRegistry: AiRiskRuleRegistryService) {}

  execute(riskRuleId: string): Promise<UseCaseResult<RiskRule | null>> {
    return this.riskRuleRegistry.getRiskRule(riskRuleId).then(useCaseResult);
  }
}

export class ListRiskRulesUseCase {
  constructor(private readonly riskRuleRegistry: AiRiskRuleRegistryService) {}

  execute(): Promise<UseCaseResult<ListRiskRulesResult>> {
    return this.riskRuleRegistry.listRiskRules().then(useCaseResult);
  }
}

export class UpdateRiskRuleUseCase {
  constructor(private readonly riskRuleRegistry: AiRiskRuleRegistryService) {}

  execute(input: UpdateRiskRuleInput): Promise<UseCaseResult<RiskRule>> {
    return this.riskRuleRegistry.updateRiskRule(input).then(useCaseResult);
  }
}

export class DeleteRiskRuleUseCase {
  constructor(private readonly riskRuleRegistry: AiRiskRuleRegistryService) {}

  execute(riskRuleId: string): Promise<UseCaseResult<DeleteRiskRuleResult>> {
    return this.riskRuleRegistry.deleteRiskRule(riskRuleId).then(useCaseResult);
  }
}

export class FindRiskRuleByNameUseCase {
  constructor(private readonly riskRuleRegistry: AiRiskRuleRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindRiskRuleByNameResult>> {
    return this.riskRuleRegistry.findRiskRuleByName(name).then(useCaseResult);
  }
}

export class ListRiskRulesByCategoryUseCase {
  constructor(private readonly riskRuleRegistry: AiRiskRuleRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListRiskRulesByCategoryResult>> {
    return this.riskRuleRegistry.listRiskRulesByCategory(category).then(useCaseResult);
  }
}

export class GetRiskRuleRegistryStatisticsUseCase {
  constructor(private readonly riskRuleRegistry: AiRiskRuleRegistryService) {}

  execute(): Promise<UseCaseResult<RiskRuleRegistryStatistics>> {
    return this.riskRuleRegistry.getRiskRuleRegistryStatistics().then(useCaseResult);
  }
}
