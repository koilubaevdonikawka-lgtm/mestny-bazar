import type {
  DeleteKnowledgePackageResult,
  FindKnowledgePackageByNameResult,
  ListKnowledgePackagesByCategoryResult,
  ListKnowledgePackagesResult,
  RegisterKnowledgePackageInput,
  KnowledgePackage,
  KnowledgePackageRegistryStatistics,
  UpdateKnowledgePackageInput,
} from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";
import type { AiKnowledgePackageRegistryService } from "@server/application/ai-knowledge-package-registry/services/ai-knowledge-package-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterKnowledgePackageUseCase {
  constructor(private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryService) {}

  execute(input: RegisterKnowledgePackageInput): Promise<UseCaseResult<KnowledgePackage>> {
    return this.knowledgePackageRegistry.registerKnowledgePackage(input).then(useCaseResult);
  }
}

export class GetKnowledgePackageUseCase {
  constructor(private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryService) {}

  execute(knowledgePackageId: string): Promise<UseCaseResult<KnowledgePackage | null>> {
    return this.knowledgePackageRegistry.getKnowledgePackage(knowledgePackageId).then(useCaseResult);
  }
}

export class ListKnowledgePackagesUseCase {
  constructor(private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryService) {}

  execute(): Promise<UseCaseResult<ListKnowledgePackagesResult>> {
    return this.knowledgePackageRegistry.listKnowledgePackages().then(useCaseResult);
  }
}

export class UpdateKnowledgePackageUseCase {
  constructor(private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryService) {}

  execute(input: UpdateKnowledgePackageInput): Promise<UseCaseResult<KnowledgePackage>> {
    return this.knowledgePackageRegistry.updateKnowledgePackage(input).then(useCaseResult);
  }
}

export class DeleteKnowledgePackageUseCase {
  constructor(private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryService) {}

  execute(knowledgePackageId: string): Promise<UseCaseResult<DeleteKnowledgePackageResult>> {
    return this.knowledgePackageRegistry.deleteKnowledgePackage(knowledgePackageId).then(useCaseResult);
  }
}

export class FindKnowledgePackageByNameUseCase {
  constructor(private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindKnowledgePackageByNameResult>> {
    return this.knowledgePackageRegistry.findKnowledgePackageByName(name).then(useCaseResult);
  }
}

export class ListKnowledgePackagesByCategoryUseCase {
  constructor(private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListKnowledgePackagesByCategoryResult>> {
    return this.knowledgePackageRegistry.listKnowledgePackagesByCategory(category).then(useCaseResult);
  }
}

export class GetKnowledgePackageRegistryStatisticsUseCase {
  constructor(private readonly knowledgePackageRegistry: AiKnowledgePackageRegistryService) {}

  execute(): Promise<UseCaseResult<KnowledgePackageRegistryStatistics>> {
    return this.knowledgePackageRegistry.getKnowledgePackageRegistryStatistics().then(useCaseResult);
  }
}
