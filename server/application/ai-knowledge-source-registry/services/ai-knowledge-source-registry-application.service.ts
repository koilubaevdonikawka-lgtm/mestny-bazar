import type {
  RegisterKnowledgeSourceInput,
  UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";
import {
  DeleteKnowledgeSourceUseCase,
  FindKnowledgeSourceByNameUseCase,
  GetKnowledgeSourceRegistryStatisticsUseCase,
  GetKnowledgeSourceUseCase,
  ListKnowledgeSourcesByCategoryUseCase,
  ListKnowledgeSourcesUseCase,
  RegisterKnowledgeSourceUseCase,
  UpdateKnowledgeSourceUseCase,
} from "@server/application/ai-knowledge-source-registry/use-cases/ai-knowledge-source-registry.use-cases";

/** Application facade for AI Knowledge Source Registry scenario. */
export class AiKnowledgeSourceRegistryApplicationService {
  constructor(
    private readonly registerKnowledgeSourceUseCase: RegisterKnowledgeSourceUseCase,
    private readonly getKnowledgeSourceUseCase: GetKnowledgeSourceUseCase,
    private readonly listKnowledgeSourcesUseCase: ListKnowledgeSourcesUseCase,
    private readonly updateKnowledgeSourceUseCase: UpdateKnowledgeSourceUseCase,
    private readonly deleteKnowledgeSourceUseCase: DeleteKnowledgeSourceUseCase,
    private readonly findKnowledgeSourceByNameUseCase: FindKnowledgeSourceByNameUseCase,
    private readonly listKnowledgeSourcesByCategoryUseCase: ListKnowledgeSourcesByCategoryUseCase,
    private readonly getKnowledgeSourceRegistryStatisticsUseCase: GetKnowledgeSourceRegistryStatisticsUseCase,
  ) {}

  registerKnowledgeSource(input: RegisterKnowledgeSourceInput) {
    return this.registerKnowledgeSourceUseCase.execute(input);
  }

  getKnowledgeSource(knowledgeSourceId: string) {
    return this.getKnowledgeSourceUseCase.execute(knowledgeSourceId);
  }

  listKnowledgeSources() {
    return this.listKnowledgeSourcesUseCase.execute();
  }

  updateKnowledgeSource(input: UpdateKnowledgeSourceInput) {
    return this.updateKnowledgeSourceUseCase.execute(input);
  }

  deleteKnowledgeSource(knowledgeSourceId: string) {
    return this.deleteKnowledgeSourceUseCase.execute(knowledgeSourceId);
  }

  findKnowledgeSourceByName(name: string) {
    return this.findKnowledgeSourceByNameUseCase.execute(name);
  }

  listKnowledgeSourcesByCategory(category: string) {
    return this.listKnowledgeSourcesByCategoryUseCase.execute(category);
  }

  getKnowledgeSourceRegistryStatistics() {
    return this.getKnowledgeSourceRegistryStatisticsUseCase.execute();
  }
}
