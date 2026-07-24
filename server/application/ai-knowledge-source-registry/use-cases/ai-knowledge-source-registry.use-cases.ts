import type {
  DeleteKnowledgeSourceResult,
  FindKnowledgeSourceByNameResult,
  ListKnowledgeSourcesByCategoryResult,
  ListKnowledgeSourcesResult,
  RegisterKnowledgeSourceInput,
  KnowledgeSource,
  KnowledgeSourceRegistryStatistics,
  UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";
import type { AiKnowledgeSourceRegistryService } from "@server/application/ai-knowledge-source-registry/services/ai-knowledge-source-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterKnowledgeSourceUseCase {
  constructor(private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryService) {}

  execute(input: RegisterKnowledgeSourceInput): Promise<UseCaseResult<KnowledgeSource>> {
    return this.knowledgeSourceRegistry.registerKnowledgeSource(input).then(useCaseResult);
  }
}

export class GetKnowledgeSourceUseCase {
  constructor(private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryService) {}

  execute(knowledgeSourceId: string): Promise<UseCaseResult<KnowledgeSource | null>> {
    return this.knowledgeSourceRegistry.getKnowledgeSource(knowledgeSourceId).then(useCaseResult);
  }
}

export class ListKnowledgeSourcesUseCase {
  constructor(private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryService) {}

  execute(): Promise<UseCaseResult<ListKnowledgeSourcesResult>> {
    return this.knowledgeSourceRegistry.listKnowledgeSources().then(useCaseResult);
  }
}

export class UpdateKnowledgeSourceUseCase {
  constructor(private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryService) {}

  execute(input: UpdateKnowledgeSourceInput): Promise<UseCaseResult<KnowledgeSource>> {
    return this.knowledgeSourceRegistry.updateKnowledgeSource(input).then(useCaseResult);
  }
}

export class DeleteKnowledgeSourceUseCase {
  constructor(private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryService) {}

  execute(knowledgeSourceId: string): Promise<UseCaseResult<DeleteKnowledgeSourceResult>> {
    return this.knowledgeSourceRegistry.deleteKnowledgeSource(knowledgeSourceId).then(useCaseResult);
  }
}

export class FindKnowledgeSourceByNameUseCase {
  constructor(private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindKnowledgeSourceByNameResult>> {
    return this.knowledgeSourceRegistry.findKnowledgeSourceByName(name).then(useCaseResult);
  }
}

export class ListKnowledgeSourcesByCategoryUseCase {
  constructor(private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListKnowledgeSourcesByCategoryResult>> {
    return this.knowledgeSourceRegistry.listKnowledgeSourcesByCategory(category).then(useCaseResult);
  }
}

export class GetKnowledgeSourceRegistryStatisticsUseCase {
  constructor(private readonly knowledgeSourceRegistry: AiKnowledgeSourceRegistryService) {}

  execute(): Promise<UseCaseResult<KnowledgeSourceRegistryStatistics>> {
    return this.knowledgeSourceRegistry.getKnowledgeSourceRegistryStatistics().then(useCaseResult);
  }
}
