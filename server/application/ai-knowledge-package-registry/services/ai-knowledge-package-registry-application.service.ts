import type {
  RegisterKnowledgePackageInput,
  UpdateKnowledgePackageInput,
} from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";
import {
  DeleteKnowledgePackageUseCase,
  FindKnowledgePackageByNameUseCase,
  GetKnowledgePackageRegistryStatisticsUseCase,
  GetKnowledgePackageUseCase,
  ListKnowledgePackagesByCategoryUseCase,
  ListKnowledgePackagesUseCase,
  RegisterKnowledgePackageUseCase,
  UpdateKnowledgePackageUseCase,
} from "@server/application/ai-knowledge-package-registry/use-cases/ai-knowledge-package-registry.use-cases";

/** Application facade for AI Knowledge Package Registry scenario. */
export class AiKnowledgePackageRegistryApplicationService {
  constructor(
    private readonly registerKnowledgePackageUseCase: RegisterKnowledgePackageUseCase,
    private readonly getKnowledgePackageUseCase: GetKnowledgePackageUseCase,
    private readonly listKnowledgePackagesUseCase: ListKnowledgePackagesUseCase,
    private readonly updateKnowledgePackageUseCase: UpdateKnowledgePackageUseCase,
    private readonly deleteKnowledgePackageUseCase: DeleteKnowledgePackageUseCase,
    private readonly findKnowledgePackageByNameUseCase: FindKnowledgePackageByNameUseCase,
    private readonly listKnowledgePackagesByCategoryUseCase: ListKnowledgePackagesByCategoryUseCase,
    private readonly getKnowledgePackageRegistryStatisticsUseCase: GetKnowledgePackageRegistryStatisticsUseCase,
  ) {}

  registerKnowledgePackage(input: RegisterKnowledgePackageInput) {
    return this.registerKnowledgePackageUseCase.execute(input);
  }

  getKnowledgePackage(knowledgePackageId: string) {
    return this.getKnowledgePackageUseCase.execute(knowledgePackageId);
  }

  listKnowledgePackages() {
    return this.listKnowledgePackagesUseCase.execute();
  }

  updateKnowledgePackage(input: UpdateKnowledgePackageInput) {
    return this.updateKnowledgePackageUseCase.execute(input);
  }

  deleteKnowledgePackage(knowledgePackageId: string) {
    return this.deleteKnowledgePackageUseCase.execute(knowledgePackageId);
  }

  findKnowledgePackageByName(name: string) {
    return this.findKnowledgePackageByNameUseCase.execute(name);
  }

  listKnowledgePackagesByCategory(category: string) {
    return this.listKnowledgePackagesByCategoryUseCase.execute(category);
  }

  getKnowledgePackageRegistryStatistics() {
    return this.getKnowledgePackageRegistryStatisticsUseCase.execute();
  }
}
