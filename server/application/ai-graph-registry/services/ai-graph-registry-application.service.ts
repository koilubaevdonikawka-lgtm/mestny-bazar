import type {
  RegisterGraphInput,
  UpdateGraphInput,
} from "@server/application/ai-graph-registry/models/graph.model";
import {
  DeleteGraphUseCase,
  FindGraphByNameUseCase,
  GetGraphRegistryStatisticsUseCase,
  GetGraphUseCase,
  ListGraphsByCategoryUseCase,
  ListGraphsUseCase,
  RegisterGraphUseCase,
  UpdateGraphUseCase,
} from "@server/application/ai-graph-registry/use-cases/ai-graph-registry.use-cases";

/** Application facade for AI Graph Registry scenario. */
export class AiGraphRegistryApplicationService {
  constructor(
    private readonly registerGraphUseCase: RegisterGraphUseCase,
    private readonly getGraphUseCase: GetGraphUseCase,
    private readonly listGraphsUseCase: ListGraphsUseCase,
    private readonly updateGraphUseCase: UpdateGraphUseCase,
    private readonly deleteGraphUseCase: DeleteGraphUseCase,
    private readonly findGraphByNameUseCase: FindGraphByNameUseCase,
    private readonly listGraphsByCategoryUseCase: ListGraphsByCategoryUseCase,
    private readonly getGraphRegistryStatisticsUseCase: GetGraphRegistryStatisticsUseCase,
  ) {}

  registerGraph(input: RegisterGraphInput) {
    return this.registerGraphUseCase.execute(input);
  }

  getGraph(graphId: string) {
    return this.getGraphUseCase.execute(graphId);
  }

  listGraphs() {
    return this.listGraphsUseCase.execute();
  }

  updateGraph(input: UpdateGraphInput) {
    return this.updateGraphUseCase.execute(input);
  }

  deleteGraph(graphId: string) {
    return this.deleteGraphUseCase.execute(graphId);
  }

  findGraphByName(name: string) {
    return this.findGraphByNameUseCase.execute(name);
  }

  listGraphsByCategory(category: string) {
    return this.listGraphsByCategoryUseCase.execute(category);
  }

  getGraphRegistryStatistics() {
    return this.getGraphRegistryStatisticsUseCase.execute();
  }
}
