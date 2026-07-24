import type {
  RegisterRuleInput,
  UpdateRuleInput,
} from "@server/application/ai-rule-registry/models/rule.model";
import {
  DeleteRuleUseCase,
  FindRuleByNameUseCase,
  GetRuleRegistryStatisticsUseCase,
  GetRuleUseCase,
  ListRulesByCategoryUseCase,
  ListRulesUseCase,
  RegisterRuleUseCase,
  UpdateRuleUseCase,
} from "@server/application/ai-rule-registry/use-cases/ai-rule-registry.use-cases";

/** Application facade for AI Rule Registry scenario. */
export class AiRuleRegistryApplicationService {
  constructor(
    private readonly registerRuleUseCase: RegisterRuleUseCase,
    private readonly getRuleUseCase: GetRuleUseCase,
    private readonly listRulesUseCase: ListRulesUseCase,
    private readonly updateRuleUseCase: UpdateRuleUseCase,
    private readonly deleteRuleUseCase: DeleteRuleUseCase,
    private readonly findRuleByNameUseCase: FindRuleByNameUseCase,
    private readonly listRulesByCategoryUseCase: ListRulesByCategoryUseCase,
    private readonly getRuleRegistryStatisticsUseCase: GetRuleRegistryStatisticsUseCase,
  ) {}

  registerRule(input: RegisterRuleInput) {
    return this.registerRuleUseCase.execute(input);
  }

  getRule(ruleId: string) {
    return this.getRuleUseCase.execute(ruleId);
  }

  listRules() {
    return this.listRulesUseCase.execute();
  }

  updateRule(input: UpdateRuleInput) {
    return this.updateRuleUseCase.execute(input);
  }

  deleteRule(ruleId: string) {
    return this.deleteRuleUseCase.execute(ruleId);
  }

  findRuleByName(name: string) {
    return this.findRuleByNameUseCase.execute(name);
  }

  listRulesByCategory(category: string) {
    return this.listRulesByCategoryUseCase.execute(category);
  }

  getRuleRegistryStatistics() {
    return this.getRuleRegistryStatisticsUseCase.execute();
  }
}
