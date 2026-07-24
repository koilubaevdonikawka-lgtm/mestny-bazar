import type {
  RegisterTaxonomyInput,
  UpdateTaxonomyInput,
} from "@server/application/ai-taxonomy-registry/models/taxonomy.model";
import {
  DeleteTaxonomyUseCase,
  FindTaxonomyByNameUseCase,
  GetTaxonomyRegistryStatisticsUseCase,
  GetTaxonomyUseCase,
  ListTaxonomiesByCategoryUseCase,
  ListTaxonomiesUseCase,
  RegisterTaxonomyUseCase,
  UpdateTaxonomyUseCase,
} from "@server/application/ai-taxonomy-registry/use-cases/ai-taxonomy-registry.use-cases";

/** Application facade for AI Taxonomy Registry scenario. */
export class AiTaxonomyRegistryApplicationService {
  constructor(
    private readonly registerTaxonomyUseCase: RegisterTaxonomyUseCase,
    private readonly getTaxonomyUseCase: GetTaxonomyUseCase,
    private readonly listTaxonomiesUseCase: ListTaxonomiesUseCase,
    private readonly updateTaxonomyUseCase: UpdateTaxonomyUseCase,
    private readonly deleteTaxonomyUseCase: DeleteTaxonomyUseCase,
    private readonly findTaxonomyByNameUseCase: FindTaxonomyByNameUseCase,
    private readonly listTaxonomiesByCategoryUseCase: ListTaxonomiesByCategoryUseCase,
    private readonly getTaxonomyRegistryStatisticsUseCase: GetTaxonomyRegistryStatisticsUseCase,
  ) {}

  registerTaxonomy(input: RegisterTaxonomyInput) {
    return this.registerTaxonomyUseCase.execute(input);
  }

  getTaxonomy(taxonomyId: string) {
    return this.getTaxonomyUseCase.execute(taxonomyId);
  }

  listTaxonomies() {
    return this.listTaxonomiesUseCase.execute();
  }

  updateTaxonomy(input: UpdateTaxonomyInput) {
    return this.updateTaxonomyUseCase.execute(input);
  }

  deleteTaxonomy(taxonomyId: string) {
    return this.deleteTaxonomyUseCase.execute(taxonomyId);
  }

  findTaxonomyByName(name: string) {
    return this.findTaxonomyByNameUseCase.execute(name);
  }

  listTaxonomiesByCategory(category: string) {
    return this.listTaxonomiesByCategoryUseCase.execute(category);
  }

  getTaxonomyRegistryStatistics() {
    return this.getTaxonomyRegistryStatisticsUseCase.execute();
  }
}
