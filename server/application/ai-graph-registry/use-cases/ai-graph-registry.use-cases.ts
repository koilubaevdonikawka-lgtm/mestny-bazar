import type {
  DeleteGraphResult,
  FindGraphByNameResult,
  ListGraphsByCategoryResult,
  ListGraphsResult,
  RegisterGraphInput,
  Graph,
  GraphRegistryStatistics,
  UpdateGraphInput,
} from "@server/application/ai-graph-registry/models/graph.model";
import type { AiGraphRegistryService } from "@server/application/ai-graph-registry/services/ai-graph-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterGraphUseCase {
  constructor(private readonly graphRegistry: AiGraphRegistryService) {}

  execute(input: RegisterGraphInput): Promise<UseCaseResult<Graph>> {
    return this.graphRegistry.registerGraph(input).then(useCaseResult);
  }
}

export class GetGraphUseCase {
  constructor(private readonly graphRegistry: AiGraphRegistryService) {}

  execute(graphId: string): Promise<UseCaseResult<Graph | null>> {
    return this.graphRegistry.getGraph(graphId).then(useCaseResult);
  }
}

export class ListGraphsUseCase {
  constructor(private readonly graphRegistry: AiGraphRegistryService) {}

  execute(): Promise<UseCaseResult<ListGraphsResult>> {
    return this.graphRegistry.listGraphs().then(useCaseResult);
  }
}

export class UpdateGraphUseCase {
  constructor(private readonly graphRegistry: AiGraphRegistryService) {}

  execute(input: UpdateGraphInput): Promise<UseCaseResult<Graph>> {
    return this.graphRegistry.updateGraph(input).then(useCaseResult);
  }
}

export class DeleteGraphUseCase {
  constructor(private readonly graphRegistry: AiGraphRegistryService) {}

  execute(graphId: string): Promise<UseCaseResult<DeleteGraphResult>> {
    return this.graphRegistry.deleteGraph(graphId).then(useCaseResult);
  }
}

export class FindGraphByNameUseCase {
  constructor(private readonly graphRegistry: AiGraphRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindGraphByNameResult>> {
    return this.graphRegistry.findGraphByName(name).then(useCaseResult);
  }
}

export class ListGraphsByCategoryUseCase {
  constructor(private readonly graphRegistry: AiGraphRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListGraphsByCategoryResult>> {
    return this.graphRegistry.listGraphsByCategory(category).then(useCaseResult);
  }
}

export class GetGraphRegistryStatisticsUseCase {
  constructor(private readonly graphRegistry: AiGraphRegistryService) {}

  execute(): Promise<UseCaseResult<GraphRegistryStatistics>> {
    return this.graphRegistry.getGraphRegistryStatistics().then(useCaseResult);
  }
}
