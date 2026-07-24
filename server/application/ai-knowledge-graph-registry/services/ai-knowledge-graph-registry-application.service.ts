import type {
  RegisterKnowledgeGraphInput,
  UpdateKnowledgeGraphInput,
} from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";
import {
  DeleteKnowledgeGraphUseCase,
  FindKnowledgeGraphByNameUseCase,
  GetKnowledgeGraphRegistryStatisticsUseCase,
  GetKnowledgeGraphUseCase,
  ListKnowledgeGraphsByCategoryUseCase,
  ListKnowledgeGraphsUseCase,
  RegisterKnowledgeGraphUseCase,
  UpdateKnowledgeGraphUseCase,
} from "@server/application/ai-knowledge-graph-registry/use-cases/ai-knowledge-graph-registry.use-cases";

/** Application facade for AI Knowledge Graph Registry scenario. */
export class AiKnowledgeGraphRegistryApplicationService {
  constructor(
    private readonly registerKnowledgeGraphUseCase: RegisterKnowledgeGraphUseCase,
    private readonly getKnowledgeGraphUseCase: GetKnowledgeGraphUseCase,
    private readonly listKnowledgeGraphsUseCase: ListKnowledgeGraphsUseCase,
    private readonly updateKnowledgeGraphUseCase: UpdateKnowledgeGraphUseCase,
    private readonly deleteKnowledgeGraphUseCase: DeleteKnowledgeGraphUseCase,
    private readonly findKnowledgeGraphByNameUseCase: FindKnowledgeGraphByNameUseCase,
    private readonly listKnowledgeGraphsByCategoryUseCase: ListKnowledgeGraphsByCategoryUseCase,
    private readonly getKnowledgeGraphRegistryStatisticsUseCase: GetKnowledgeGraphRegistryStatisticsUseCase,
  ) {}

  registerKnowledgeGraph(input: RegisterKnowledgeGraphInput) {
    return this.registerKnowledgeGraphUseCase.execute(input);
  }

  getKnowledgeGraph(knowledgeGraphId: string) {
    return this.getKnowledgeGraphUseCase.execute(knowledgeGraphId);
  }

  listKnowledgeGraphs() {
    return this.listKnowledgeGraphsUseCase.execute();
  }

  updateKnowledgeGraph(input: UpdateKnowledgeGraphInput) {
    return this.updateKnowledgeGraphUseCase.execute(input);
  }

  deleteKnowledgeGraph(knowledgeGraphId: string) {
    return this.deleteKnowledgeGraphUseCase.execute(knowledgeGraphId);
  }

  findKnowledgeGraphByName(name: string) {
    return this.findKnowledgeGraphByNameUseCase.execute(name);
  }

  listKnowledgeGraphsByCategory(category: string) {
    return this.listKnowledgeGraphsByCategoryUseCase.execute(category);
  }

  getKnowledgeGraphRegistryStatistics() {
    return this.getKnowledgeGraphRegistryStatisticsUseCase.execute();
  }
}
