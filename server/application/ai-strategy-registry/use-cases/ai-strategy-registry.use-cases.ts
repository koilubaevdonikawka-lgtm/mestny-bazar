import type {
  DeleteStrategyResult,
  FindStrategyByNameResult,
  ListStrategiesByCategoryResult,
  ListStrategiesResult,
  RegisterStrategyInput,
  Strategy,
  StrategyRegistryStatistics,
  UpdateStrategyInput,
} from "@server/application/ai-strategy-registry/models/strategy.model";
import type { AiStrategyRegistryService } from "@server/application/ai-strategy-registry/services/ai-strategy-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterStrategyUseCase {
  constructor(private readonly strategyRegistry: AiStrategyRegistryService) {}

  execute(input: RegisterStrategyInput): Promise<UseCaseResult<Strategy>> {
    return this.strategyRegistry.registerStrategy(input).then(useCaseResult);
  }
}

export class GetStrategyUseCase {
  constructor(private readonly strategyRegistry: AiStrategyRegistryService) {}

  execute(strategyId: string): Promise<UseCaseResult<Strategy | null>> {
    return this.strategyRegistry.getStrategy(strategyId).then(useCaseResult);
  }
}

export class ListStrategiesUseCase {
  constructor(private readonly strategyRegistry: AiStrategyRegistryService) {}

  execute(): Promise<UseCaseResult<ListStrategiesResult>> {
    return this.strategyRegistry.listStrategies().then(useCaseResult);
  }
}

export class UpdateStrategyUseCase {
  constructor(private readonly strategyRegistry: AiStrategyRegistryService) {}

  execute(input: UpdateStrategyInput): Promise<UseCaseResult<Strategy>> {
    return this.strategyRegistry.updateStrategy(input).then(useCaseResult);
  }
}

export class DeleteStrategyUseCase {
  constructor(private readonly strategyRegistry: AiStrategyRegistryService) {}

  execute(strategyId: string): Promise<UseCaseResult<DeleteStrategyResult>> {
    return this.strategyRegistry.deleteStrategy(strategyId).then(useCaseResult);
  }
}

export class FindStrategyByNameUseCase {
  constructor(private readonly strategyRegistry: AiStrategyRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindStrategyByNameResult>> {
    return this.strategyRegistry.findStrategyByName(name).then(useCaseResult);
  }
}

export class ListStrategiesByCategoryUseCase {
  constructor(private readonly strategyRegistry: AiStrategyRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListStrategiesByCategoryResult>> {
    return this.strategyRegistry.listStrategiesByCategory(category).then(useCaseResult);
  }
}

export class GetStrategyRegistryStatisticsUseCase {
  constructor(private readonly strategyRegistry: AiStrategyRegistryService) {}

  execute(): Promise<UseCaseResult<StrategyRegistryStatistics>> {
    return this.strategyRegistry.getStrategyRegistryStatistics().then(useCaseResult);
  }
}
