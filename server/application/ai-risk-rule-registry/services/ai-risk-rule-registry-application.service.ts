import type {
  RegisterRiskRuleInput,
  UpdateRiskRuleInput,
} from "@server/application/ai-risk-rule-registry/models/risk-rule.model";
import {
  DeleteRiskRuleUseCase,
  FindRiskRuleByNameUseCase,
  GetRiskRuleRegistryStatisticsUseCase,
  GetRiskRuleUseCase,
  ListRiskRulesByCategoryUseCase,
  ListRiskRulesUseCase,
  RegisterRiskRuleUseCase,
  UpdateRiskRuleUseCase,
} from "@server/application/ai-risk-rule-registry/use-cases/ai-risk-rule-registry.use-cases";

/** Application facade for AI Risk Rule Registry scenario. */
export class AiRiskRuleRegistryApplicationService {
  constructor(
    private readonly registerRiskRuleUseCase: RegisterRiskRuleUseCase,
    private readonly getRiskRuleUseCase: GetRiskRuleUseCase,
    private readonly listRiskRulesUseCase: ListRiskRulesUseCase,
    private readonly updateRiskRuleUseCase: UpdateRiskRuleUseCase,
    private readonly deleteRiskRuleUseCase: DeleteRiskRuleUseCase,
    private readonly findRiskRuleByNameUseCase: FindRiskRuleByNameUseCase,
    private readonly listRiskRulesByCategoryUseCase: ListRiskRulesByCategoryUseCase,
    private readonly getRiskRuleRegistryStatisticsUseCase: GetRiskRuleRegistryStatisticsUseCase,
  ) {}

  registerRiskRule(input: RegisterRiskRuleInput) {
    return this.registerRiskRuleUseCase.execute(input);
  }

  getRiskRule(riskRuleId: string) {
    return this.getRiskRuleUseCase.execute(riskRuleId);
  }

  listRiskRules() {
    return this.listRiskRulesUseCase.execute();
  }

  updateRiskRule(input: UpdateRiskRuleInput) {
    return this.updateRiskRuleUseCase.execute(input);
  }

  deleteRiskRule(riskRuleId: string) {
    return this.deleteRiskRuleUseCase.execute(riskRuleId);
  }

  findRiskRuleByName(name: string) {
    return this.findRiskRuleByNameUseCase.execute(name);
  }

  listRiskRulesByCategory(category: string) {
    return this.listRiskRulesByCategoryUseCase.execute(category);
  }

  getRiskRuleRegistryStatistics() {
    return this.getRiskRuleRegistryStatisticsUseCase.execute();
  }
}
