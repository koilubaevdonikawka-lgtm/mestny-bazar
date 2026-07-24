import type {
  DeleteScenarioResult,
  FindScenarioByNameResult,
  ListScenariosByCategoryResult,
  ListScenariosResult,
  RegisterScenarioInput,
  Scenario,
  ScenarioRegistryStatistics,
  UpdateScenarioInput,
} from "@server/application/ai-scenario-registry/models/scenario.model";
import type { AiScenarioRegistryService } from "@server/application/ai-scenario-registry/services/ai-scenario-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterScenarioUseCase {
  constructor(private readonly scenarioRegistry: AiScenarioRegistryService) {}

  execute(input: RegisterScenarioInput): Promise<UseCaseResult<Scenario>> {
    return this.scenarioRegistry.registerScenario(input).then(useCaseResult);
  }
}

export class GetScenarioUseCase {
  constructor(private readonly scenarioRegistry: AiScenarioRegistryService) {}

  execute(scenarioId: string): Promise<UseCaseResult<Scenario | null>> {
    return this.scenarioRegistry.getScenario(scenarioId).then(useCaseResult);
  }
}

export class ListScenariosUseCase {
  constructor(private readonly scenarioRegistry: AiScenarioRegistryService) {}

  execute(): Promise<UseCaseResult<ListScenariosResult>> {
    return this.scenarioRegistry.listScenarios().then(useCaseResult);
  }
}

export class UpdateScenarioUseCase {
  constructor(private readonly scenarioRegistry: AiScenarioRegistryService) {}

  execute(input: UpdateScenarioInput): Promise<UseCaseResult<Scenario>> {
    return this.scenarioRegistry.updateScenario(input).then(useCaseResult);
  }
}

export class DeleteScenarioUseCase {
  constructor(private readonly scenarioRegistry: AiScenarioRegistryService) {}

  execute(scenarioId: string): Promise<UseCaseResult<DeleteScenarioResult>> {
    return this.scenarioRegistry.deleteScenario(scenarioId).then(useCaseResult);
  }
}

export class FindScenarioByNameUseCase {
  constructor(private readonly scenarioRegistry: AiScenarioRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindScenarioByNameResult>> {
    return this.scenarioRegistry.findScenarioByName(name).then(useCaseResult);
  }
}

export class ListScenariosByCategoryUseCase {
  constructor(private readonly scenarioRegistry: AiScenarioRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListScenariosByCategoryResult>> {
    return this.scenarioRegistry.listScenariosByCategory(category).then(useCaseResult);
  }
}

export class GetScenarioRegistryStatisticsUseCase {
  constructor(private readonly scenarioRegistry: AiScenarioRegistryService) {}

  execute(): Promise<UseCaseResult<ScenarioRegistryStatistics>> {
    return this.scenarioRegistry.getScenarioRegistryStatistics().then(useCaseResult);
  }
}
