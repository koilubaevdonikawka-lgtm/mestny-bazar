import type {
  DeleteKnowledgeSourceResult,
  FindKnowledgeSourceByNameResult,
  KnowledgeRegistryStatistics,
  KnowledgeSource,
  ListKnowledgeSourcesByCategoryResult,
  ListKnowledgeSourcesResult,
  RegisterKnowledgeSourceInput,
  UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-registry/models/knowledge-source.model";
import type { AiKnowledgeRegistryService } from "@server/application/ai-knowledge-registry/services/ai-knowledge-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterKnowledgeSourceUseCase {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryService) {}

  execute(input: RegisterKnowledgeSourceInput): Promise<UseCaseResult<KnowledgeSource>> {
    return this.knowledgeRegistry.registerKnowledgeSource(input).then(useCaseResult);
  }
}

export class GetKnowledgeSourceUseCase {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryService) {}

  execute(knowledgeId: string): Promise<UseCaseResult<KnowledgeSource | null>> {
    return this.knowledgeRegistry.getKnowledgeSource(knowledgeId).then(useCaseResult);
  }
}

export class ListKnowledgeSourcesUseCase {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryService) {}

  execute(): Promise<UseCaseResult<ListKnowledgeSourcesResult>> {
    return this.knowledgeRegistry.listKnowledgeSources().then(useCaseResult);
  }
}

export class UpdateKnowledgeSourceUseCase {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryService) {}

  execute(input: UpdateKnowledgeSourceInput): Promise<UseCaseResult<KnowledgeSource>> {
    return this.knowledgeRegistry.updateKnowledgeSource(input).then(useCaseResult);
  }
}

export class DeleteKnowledgeSourceUseCase {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryService) {}

  execute(knowledgeId: string): Promise<UseCaseResult<DeleteKnowledgeSourceResult>> {
    return this.knowledgeRegistry.deleteKnowledgeSource(knowledgeId).then(useCaseResult);
  }
}

export class FindKnowledgeSourceByNameUseCase {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindKnowledgeSourceByNameResult>> {
    return this.knowledgeRegistry.findKnowledgeSourceByName(name).then(useCaseResult);
  }
}

export class ListKnowledgeSourcesByCategoryUseCase {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListKnowledgeSourcesByCategoryResult>> {
    return this.knowledgeRegistry.listKnowledgeSourcesByCategory(category).then(useCaseResult);
  }
}

export class GetKnowledgeRegistryStatisticsUseCase {
  constructor(private readonly knowledgeRegistry: AiKnowledgeRegistryService) {}

  execute(): Promise<UseCaseResult<KnowledgeRegistryStatistics>> {
    return this.knowledgeRegistry.getKnowledgeRegistryStatistics().then(useCaseResult);
  }
}
