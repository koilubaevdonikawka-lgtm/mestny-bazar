import type {
  RegisterKnowledgeSourceInput,
  UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-registry/models/knowledge-source.model";
import {
  DeleteKnowledgeSourceUseCase,
  FindKnowledgeSourceByNameUseCase,
  GetKnowledgeRegistryStatisticsUseCase,
  GetKnowledgeSourceUseCase,
  ListKnowledgeSourcesByCategoryUseCase,
  ListKnowledgeSourcesUseCase,
  RegisterKnowledgeSourceUseCase,
  UpdateKnowledgeSourceUseCase,
} from "@server/application/ai-knowledge-registry/use-cases/ai-knowledge-registry.use-cases";

/** Application facade for AI Knowledge Registry scenario. */
export class AiKnowledgeRegistryApplicationService {
  constructor(
    private readonly registerKnowledgeSourceUseCase: RegisterKnowledgeSourceUseCase,
    private readonly getKnowledgeSourceUseCase: GetKnowledgeSourceUseCase,
    private readonly listKnowledgeSourcesUseCase: ListKnowledgeSourcesUseCase,
    private readonly updateKnowledgeSourceUseCase: UpdateKnowledgeSourceUseCase,
    private readonly deleteKnowledgeSourceUseCase: DeleteKnowledgeSourceUseCase,
    private readonly findKnowledgeSourceByNameUseCase: FindKnowledgeSourceByNameUseCase,
    private readonly listKnowledgeSourcesByCategoryUseCase: ListKnowledgeSourcesByCategoryUseCase,
    private readonly getKnowledgeRegistryStatisticsUseCase: GetKnowledgeRegistryStatisticsUseCase,
  ) {}

  registerKnowledgeSource(input: RegisterKnowledgeSourceInput) {
    return this.registerKnowledgeSourceUseCase.execute(input);
  }

  getKnowledgeSource(knowledgeId: string) {
    return this.getKnowledgeSourceUseCase.execute(knowledgeId);
  }

  listKnowledgeSources() {
    return this.listKnowledgeSourcesUseCase.execute();
  }

  updateKnowledgeSource(input: UpdateKnowledgeSourceInput) {
    return this.updateKnowledgeSourceUseCase.execute(input);
  }

  deleteKnowledgeSource(knowledgeId: string) {
    return this.deleteKnowledgeSourceUseCase.execute(knowledgeId);
  }

  findKnowledgeSourceByName(name: string) {
    return this.findKnowledgeSourceByNameUseCase.execute(name);
  }

  listKnowledgeSourcesByCategory(category: string) {
    return this.listKnowledgeSourcesByCategoryUseCase.execute(category);
  }

  getKnowledgeRegistryStatistics() {
    return this.getKnowledgeRegistryStatisticsUseCase.execute();
  }
}
