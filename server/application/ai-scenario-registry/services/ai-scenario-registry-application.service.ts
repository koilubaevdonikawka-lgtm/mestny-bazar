import type {
  RegisterScenarioInput,
  UpdateScenarioInput,
} from "@server/application/ai-scenario-registry/models/scenario.model";
import {
  DeleteScenarioUseCase,
  FindScenarioByNameUseCase,
  GetScenarioRegistryStatisticsUseCase,
  GetScenarioUseCase,
  ListScenariosByCategoryUseCase,
  ListScenariosUseCase,
  RegisterScenarioUseCase,
  UpdateScenarioUseCase,
} from "@server/application/ai-scenario-registry/use-cases/ai-scenario-registry.use-cases";

/** Application facade for AI Scenario Registry scenario. */
export class AiScenarioRegistryApplicationService {
  constructor(
    private readonly registerScenarioUseCase: RegisterScenarioUseCase,
    private readonly getScenarioUseCase: GetScenarioUseCase,
    private readonly listScenariosUseCase: ListScenariosUseCase,
    private readonly updateScenarioUseCase: UpdateScenarioUseCase,
    private readonly deleteScenarioUseCase: DeleteScenarioUseCase,
    private readonly findScenarioByNameUseCase: FindScenarioByNameUseCase,
    private readonly listScenariosByCategoryUseCase: ListScenariosByCategoryUseCase,
    private readonly getScenarioRegistryStatisticsUseCase: GetScenarioRegistryStatisticsUseCase,
  ) {}

  registerScenario(input: RegisterScenarioInput) {
    return this.registerScenarioUseCase.execute(input);
  }

  getScenario(scenarioId: string) {
    return this.getScenarioUseCase.execute(scenarioId);
  }

  listScenarios() {
    return this.listScenariosUseCase.execute();
  }

  updateScenario(input: UpdateScenarioInput) {
    return this.updateScenarioUseCase.execute(input);
  }

  deleteScenario(scenarioId: string) {
    return this.deleteScenarioUseCase.execute(scenarioId);
  }

  findScenarioByName(name: string) {
    return this.findScenarioByNameUseCase.execute(name);
  }

  listScenariosByCategory(category: string) {
    return this.listScenariosByCategoryUseCase.execute(category);
  }

  getScenarioRegistryStatistics() {
    return this.getScenarioRegistryStatisticsUseCase.execute();
  }
}
