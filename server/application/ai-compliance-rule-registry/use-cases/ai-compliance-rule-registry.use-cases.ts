import type {
  DeleteComplianceRuleResult,
  FindComplianceRuleByNameResult,
  ComplianceRule,
  ComplianceRuleRegistryStatistics,
  ListComplianceRulesByCategoryResult,
  ListComplianceRulesResult,
  RegisterComplianceRuleInput,
  UpdateComplianceRuleInput,
} from "@server/application/ai-compliance-rule-registry/models/compliance-rule.model";
import type { AiComplianceRuleRegistryService } from "@server/application/ai-compliance-rule-registry/services/ai-compliance-rule-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterComplianceRuleUseCase {
  constructor(private readonly complianceRuleRegistry: AiComplianceRuleRegistryService) {}

  execute(input: RegisterComplianceRuleInput): Promise<UseCaseResult<ComplianceRule>> {
    return this.complianceRuleRegistry.registerComplianceRule(input).then(useCaseResult);
  }
}

export class GetComplianceRuleUseCase {
  constructor(private readonly complianceRuleRegistry: AiComplianceRuleRegistryService) {}

  execute(complianceRuleId: string): Promise<UseCaseResult<ComplianceRule | null>> {
    return this.complianceRuleRegistry.getComplianceRule(complianceRuleId).then(useCaseResult);
  }
}

export class ListComplianceRulesUseCase {
  constructor(private readonly complianceRuleRegistry: AiComplianceRuleRegistryService) {}

  execute(): Promise<UseCaseResult<ListComplianceRulesResult>> {
    return this.complianceRuleRegistry.listComplianceRules().then(useCaseResult);
  }
}

export class UpdateComplianceRuleUseCase {
  constructor(private readonly complianceRuleRegistry: AiComplianceRuleRegistryService) {}

  execute(input: UpdateComplianceRuleInput): Promise<UseCaseResult<ComplianceRule>> {
    return this.complianceRuleRegistry.updateComplianceRule(input).then(useCaseResult);
  }
}

export class DeleteComplianceRuleUseCase {
  constructor(private readonly complianceRuleRegistry: AiComplianceRuleRegistryService) {}

  execute(complianceRuleId: string): Promise<UseCaseResult<DeleteComplianceRuleResult>> {
    return this.complianceRuleRegistry.deleteComplianceRule(complianceRuleId).then(useCaseResult);
  }
}

export class FindComplianceRuleByNameUseCase {
  constructor(private readonly complianceRuleRegistry: AiComplianceRuleRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindComplianceRuleByNameResult>> {
    return this.complianceRuleRegistry.findComplianceRuleByName(name).then(useCaseResult);
  }
}

export class ListComplianceRulesByCategoryUseCase {
  constructor(private readonly complianceRuleRegistry: AiComplianceRuleRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListComplianceRulesByCategoryResult>> {
    return this.complianceRuleRegistry.listComplianceRulesByCategory(category).then(useCaseResult);
  }
}

export class GetComplianceRuleRegistryStatisticsUseCase {
  constructor(private readonly complianceRuleRegistry: AiComplianceRuleRegistryService) {}

  execute(): Promise<UseCaseResult<ComplianceRuleRegistryStatistics>> {
    return this.complianceRuleRegistry.getComplianceRuleRegistryStatistics().then(useCaseResult);
  }
}
