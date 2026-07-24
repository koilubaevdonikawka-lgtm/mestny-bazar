import type {
  DeleteSafetyRuleResult,
  FindSafetyRuleByNameResult,
  ListSafetyRulesByCategoryResult,
  ListSafetyRulesResult,
  RegisterSafetyRuleInput,
  SafetyRule,
  SafetyRuleRegistryStatistics,
  UpdateSafetyRuleInput,
} from "@server/application/ai-safety-rule-registry/models/safety-rule.model";
import type { AiSafetyRuleRegistryService } from "@server/application/ai-safety-rule-registry/services/ai-safety-rule-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSafetyRuleUseCase {
  constructor(private readonly safetyRuleRegistry: AiSafetyRuleRegistryService) {}

  execute(input: RegisterSafetyRuleInput): Promise<UseCaseResult<SafetyRule>> {
    return this.safetyRuleRegistry.registerSafetyRule(input).then(useCaseResult);
  }
}

export class GetSafetyRuleUseCase {
  constructor(private readonly safetyRuleRegistry: AiSafetyRuleRegistryService) {}

  execute(safetyRuleId: string): Promise<UseCaseResult<SafetyRule | null>> {
    return this.safetyRuleRegistry.getSafetyRule(safetyRuleId).then(useCaseResult);
  }
}

export class ListSafetyRulesUseCase {
  constructor(private readonly safetyRuleRegistry: AiSafetyRuleRegistryService) {}

  execute(): Promise<UseCaseResult<ListSafetyRulesResult>> {
    return this.safetyRuleRegistry.listSafetyRules().then(useCaseResult);
  }
}

export class UpdateSafetyRuleUseCase {
  constructor(private readonly safetyRuleRegistry: AiSafetyRuleRegistryService) {}

  execute(input: UpdateSafetyRuleInput): Promise<UseCaseResult<SafetyRule>> {
    return this.safetyRuleRegistry.updateSafetyRule(input).then(useCaseResult);
  }
}

export class DeleteSafetyRuleUseCase {
  constructor(private readonly safetyRuleRegistry: AiSafetyRuleRegistryService) {}

  execute(safetyRuleId: string): Promise<UseCaseResult<DeleteSafetyRuleResult>> {
    return this.safetyRuleRegistry.deleteSafetyRule(safetyRuleId).then(useCaseResult);
  }
}

export class FindSafetyRuleByNameUseCase {
  constructor(private readonly safetyRuleRegistry: AiSafetyRuleRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindSafetyRuleByNameResult>> {
    return this.safetyRuleRegistry.findSafetyRuleByName(name).then(useCaseResult);
  }
}

export class ListSafetyRulesByCategoryUseCase {
  constructor(private readonly safetyRuleRegistry: AiSafetyRuleRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListSafetyRulesByCategoryResult>> {
    return this.safetyRuleRegistry.listSafetyRulesByCategory(category).then(useCaseResult);
  }
}

export class GetSafetyRuleRegistryStatisticsUseCase {
  constructor(private readonly safetyRuleRegistry: AiSafetyRuleRegistryService) {}

  execute(): Promise<UseCaseResult<SafetyRuleRegistryStatistics>> {
    return this.safetyRuleRegistry.getSafetyRuleRegistryStatistics().then(useCaseResult);
  }
}
