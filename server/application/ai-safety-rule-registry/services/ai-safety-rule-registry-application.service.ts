import type {
  RegisterSafetyRuleInput,
  UpdateSafetyRuleInput,
} from "@server/application/ai-safety-rule-registry/models/safety-rule.model";
import {
  DeleteSafetyRuleUseCase,
  FindSafetyRuleByNameUseCase,
  GetSafetyRuleRegistryStatisticsUseCase,
  GetSafetyRuleUseCase,
  ListSafetyRulesByCategoryUseCase,
  ListSafetyRulesUseCase,
  RegisterSafetyRuleUseCase,
  UpdateSafetyRuleUseCase,
} from "@server/application/ai-safety-rule-registry/use-cases/ai-safety-rule-registry.use-cases";

/** Application facade for AI Safety Rule Registry scenario. */
export class AiSafetyRuleRegistryApplicationService {
  constructor(
    private readonly registerSafetyRuleUseCase: RegisterSafetyRuleUseCase,
    private readonly getSafetyRuleUseCase: GetSafetyRuleUseCase,
    private readonly listSafetyRulesUseCase: ListSafetyRulesUseCase,
    private readonly updateSafetyRuleUseCase: UpdateSafetyRuleUseCase,
    private readonly deleteSafetyRuleUseCase: DeleteSafetyRuleUseCase,
    private readonly findSafetyRuleByNameUseCase: FindSafetyRuleByNameUseCase,
    private readonly listSafetyRulesByCategoryUseCase: ListSafetyRulesByCategoryUseCase,
    private readonly getSafetyRuleRegistryStatisticsUseCase: GetSafetyRuleRegistryStatisticsUseCase,
  ) {}

  registerSafetyRule(input: RegisterSafetyRuleInput) {
    return this.registerSafetyRuleUseCase.execute(input);
  }

  getSafetyRule(safetyRuleId: string) {
    return this.getSafetyRuleUseCase.execute(safetyRuleId);
  }

  listSafetyRules() {
    return this.listSafetyRulesUseCase.execute();
  }

  updateSafetyRule(input: UpdateSafetyRuleInput) {
    return this.updateSafetyRuleUseCase.execute(input);
  }

  deleteSafetyRule(safetyRuleId: string) {
    return this.deleteSafetyRuleUseCase.execute(safetyRuleId);
  }

  findSafetyRuleByName(name: string) {
    return this.findSafetyRuleByNameUseCase.execute(name);
  }

  listSafetyRulesByCategory(category: string) {
    return this.listSafetyRulesByCategoryUseCase.execute(category);
  }

  getSafetyRuleRegistryStatistics() {
    return this.getSafetyRuleRegistryStatisticsUseCase.execute();
  }
}
