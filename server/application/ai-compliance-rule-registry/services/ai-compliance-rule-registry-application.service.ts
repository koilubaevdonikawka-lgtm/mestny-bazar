import type {
  RegisterComplianceRuleInput,
  UpdateComplianceRuleInput,
} from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";
import {
  DeleteComplianceRuleUseCase,
  FindComplianceRuleByNameUseCase,
  GetComplianceRuleRegistryStatisticsUseCase,
  GetComplianceRuleUseCase,
  ListComplianceRulesByCategoryUseCase,
  ListComplianceRulesUseCase,
  RegisterComplianceRuleUseCase,
  UpdateComplianceRuleUseCase,
} from "@server/application/ai-compliance-rule-registry/use-cases/ai-compliance-rule-registry.use-cases";

/** Application facade for AI Compliance Rule Registry scenario. */
export class AiComplianceRuleRegistryApplicationService {
  constructor(
    private readonly registerComplianceRuleUseCase: RegisterComplianceRuleUseCase,
    private readonly getComplianceRuleUseCase: GetComplianceRuleUseCase,
    private readonly listComplianceRulesUseCase: ListComplianceRulesUseCase,
    private readonly updateComplianceRuleUseCase: UpdateComplianceRuleUseCase,
    private readonly deleteComplianceRuleUseCase: DeleteComplianceRuleUseCase,
    private readonly findComplianceRuleByNameUseCase: FindComplianceRuleByNameUseCase,
    private readonly listComplianceRulesByCategoryUseCase: ListComplianceRulesByCategoryUseCase,
    private readonly getComplianceRuleRegistryStatisticsUseCase: GetComplianceRuleRegistryStatisticsUseCase,
  ) {}

  registerComplianceRule(input: RegisterComplianceRuleInput) {
    return this.registerComplianceRuleUseCase.execute(input);
  }

  getComplianceRule(complianceRuleId: string) {
    return this.getComplianceRuleUseCase.execute(complianceRuleId);
  }

  listComplianceRules() {
    return this.listComplianceRulesUseCase.execute();
  }

  updateComplianceRule(input: UpdateComplianceRuleInput) {
    return this.updateComplianceRuleUseCase.execute(input);
  }

  deleteComplianceRule(complianceRuleId: string) {
    return this.deleteComplianceRuleUseCase.execute(complianceRuleId);
  }

  findComplianceRuleByName(name: string) {
    return this.findComplianceRuleByNameUseCase.execute(name);
  }

  listComplianceRulesByCategory(category: string) {
    return this.listComplianceRulesByCategoryUseCase.execute(category);
  }

  getComplianceRuleRegistryStatistics() {
    return this.getComplianceRuleRegistryStatisticsUseCase.execute();
  }
}
