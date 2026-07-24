import type {
  DeleteKnowledgeGraphResult,
  FindKnowledgeGraphByNameResult,
  ListKnowledgeGraphsByCategoryResult,
  ListKnowledgeGraphsResult,
  RegisterKnowledgeGraphInput,
  KnowledgeGraph,
  KnowledgeGraphRegistryStatistics,
  UpdateKnowledgeGraphInput,
} from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";
import type { AiKnowledgeGraphRegistryService } from "@server/application/ai-knowledge-graph-registry/services/ai-knowledge-graph-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterKnowledgeGraphUseCase {
  constructor(private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryService) {}

  execute(input: RegisterKnowledgeGraphInput): Promise<UseCaseResult<KnowledgeGraph>> {
    return this.knowledgeGraphRegistry.registerKnowledgeGraph(input).then(useCaseResult);
  }
}

export class GetKnowledgeGraphUseCase {
  constructor(private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryService) {}

  execute(knowledgeGraphId: string): Promise<UseCaseResult<KnowledgeGraph | null>> {
    return this.knowledgeGraphRegistry.getKnowledgeGraph(knowledgeGraphId).then(useCaseResult);
  }
}

export class ListKnowledgeGraphsUseCase {
  constructor(private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryService) {}

  execute(): Promise<UseCaseResult<ListKnowledgeGraphsResult>> {
    return this.knowledgeGraphRegistry.listKnowledgeGraphs().then(useCaseResult);
  }
}

export class UpdateKnowledgeGraphUseCase {
  constructor(private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryService) {}

  execute(input: UpdateKnowledgeGraphInput): Promise<UseCaseResult<KnowledgeGraph>> {
    return this.knowledgeGraphRegistry.updateKnowledgeGraph(input).then(useCaseResult);
  }
}

export class DeleteKnowledgeGraphUseCase {
  constructor(private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryService) {}

  execute(knowledgeGraphId: string): Promise<UseCaseResult<DeleteKnowledgeGraphResult>> {
    return this.knowledgeGraphRegistry.deleteKnowledgeGraph(knowledgeGraphId).then(useCaseResult);
  }
}

export class FindKnowledgeGraphByNameUseCase {
  constructor(private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindKnowledgeGraphByNameResult>> {
    return this.knowledgeGraphRegistry.findKnowledgeGraphByName(name).then(useCaseResult);
  }
}

export class ListKnowledgeGraphsByCategoryUseCase {
  constructor(private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListKnowledgeGraphsByCategoryResult>> {
    return this.knowledgeGraphRegistry.listKnowledgeGraphsByCategory(category).then(useCaseResult);
  }
}

export class GetKnowledgeGraphRegistryStatisticsUseCase {
  constructor(private readonly knowledgeGraphRegistry: AiKnowledgeGraphRegistryService) {}

  execute(): Promise<UseCaseResult<KnowledgeGraphRegistryStatistics>> {
    return this.knowledgeGraphRegistry.getKnowledgeGraphRegistryStatistics().then(useCaseResult);
  }
}
