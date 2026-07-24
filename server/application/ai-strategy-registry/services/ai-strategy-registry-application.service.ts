import type {
  RegisterStrategyInput,
  UpdateStrategyInput,
} from "@server/application/ai-strategy-registry/models/strategy.model";
import {
  DeleteStrategyUseCase,
  FindStrategyByNameUseCase,
  GetStrategyRegistryStatisticsUseCase,
  GetStrategyUseCase,
  ListStrategiesByCategoryUseCase,
  ListStrategiesUseCase,
  RegisterStrategyUseCase,
  UpdateStrategyUseCase,
} from "@server/application/ai-strategy-registry/use-cases/ai-strategy-registry.use-cases";

/** Application facade for AI Strategy Registry scenario. */
export class AiStrategyRegistryApplicationService {
  constructor(
    private readonly registerStrategyUseCase: RegisterStrategyUseCase,
    private readonly getStrategyUseCase: GetStrategyUseCase,
    private readonly listStrategiesUseCase: ListStrategiesUseCase,
    private readonly updateStrategyUseCase: UpdateStrategyUseCase,
    private readonly deleteStrategyUseCase: DeleteStrategyUseCase,
    private readonly findStrategyByNameUseCase: FindStrategyByNameUseCase,
    private readonly listStrategiesByCategoryUseCase: ListStrategiesByCategoryUseCase,
    private readonly getStrategyRegistryStatisticsUseCase: GetStrategyRegistryStatisticsUseCase,
  ) {}

  registerStrategy(input: RegisterStrategyInput) {
    return this.registerStrategyUseCase.execute(input);
  }

  getStrategy(strategyId: string) {
    return this.getStrategyUseCase.execute(strategyId);
  }

  listStrategies() {
    return this.listStrategiesUseCase.execute();
  }

  updateStrategy(input: UpdateStrategyInput) {
    return this.updateStrategyUseCase.execute(input);
  }

  deleteStrategy(strategyId: string) {
    return this.deleteStrategyUseCase.execute(strategyId);
  }

  findStrategyByName(name: string) {
    return this.findStrategyByNameUseCase.execute(name);
  }

  listStrategiesByCategory(category: string) {
    return this.listStrategiesByCategoryUseCase.execute(category);
  }

  getStrategyRegistryStatistics() {
    return this.getStrategyRegistryStatisticsUseCase.execute();
  }
}
