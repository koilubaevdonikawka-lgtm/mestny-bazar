import type {
  DeleteTaxonomyResult,
  FindTaxonomyByNameResult,
  ListTaxonomiesByCategoryResult,
  ListTaxonomiesResult,
  RegisterTaxonomyInput,
  Taxonomy,
  TaxonomyRegistryStatistics,
  UpdateTaxonomyInput,
} from "@server/application/ai-taxonomy-registry/models/taxonomy.model";
import type { AiTaxonomyRegistryService } from "@server/application/ai-taxonomy-registry/services/ai-taxonomy-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterTaxonomyUseCase {
  constructor(private readonly taxonomyRegistry: AiTaxonomyRegistryService) {}

  execute(input: RegisterTaxonomyInput): Promise<UseCaseResult<Taxonomy>> {
    return this.taxonomyRegistry.registerTaxonomy(input).then(useCaseResult);
  }
}

export class GetTaxonomyUseCase {
  constructor(private readonly taxonomyRegistry: AiTaxonomyRegistryService) {}

  execute(taxonomyId: string): Promise<UseCaseResult<Taxonomy | null>> {
    return this.taxonomyRegistry.getTaxonomy(taxonomyId).then(useCaseResult);
  }
}

export class ListTaxonomiesUseCase {
  constructor(private readonly taxonomyRegistry: AiTaxonomyRegistryService) {}

  execute(): Promise<UseCaseResult<ListTaxonomiesResult>> {
    return this.taxonomyRegistry.listTaxonomies().then(useCaseResult);
  }
}

export class UpdateTaxonomyUseCase {
  constructor(private readonly taxonomyRegistry: AiTaxonomyRegistryService) {}

  execute(input: UpdateTaxonomyInput): Promise<UseCaseResult<Taxonomy>> {
    return this.taxonomyRegistry.updateTaxonomy(input).then(useCaseResult);
  }
}

export class DeleteTaxonomyUseCase {
  constructor(private readonly taxonomyRegistry: AiTaxonomyRegistryService) {}

  execute(taxonomyId: string): Promise<UseCaseResult<DeleteTaxonomyResult>> {
    return this.taxonomyRegistry.deleteTaxonomy(taxonomyId).then(useCaseResult);
  }
}

export class FindTaxonomyByNameUseCase {
  constructor(private readonly taxonomyRegistry: AiTaxonomyRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindTaxonomyByNameResult>> {
    return this.taxonomyRegistry.findTaxonomyByName(name).then(useCaseResult);
  }
}

export class ListTaxonomiesByCategoryUseCase {
  constructor(private readonly taxonomyRegistry: AiTaxonomyRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListTaxonomiesByCategoryResult>> {
    return this.taxonomyRegistry.listTaxonomiesByCategory(category).then(useCaseResult);
  }
}

export class GetTaxonomyRegistryStatisticsUseCase {
  constructor(private readonly taxonomyRegistry: AiTaxonomyRegistryService) {}

  execute(): Promise<UseCaseResult<TaxonomyRegistryStatistics>> {
    return this.taxonomyRegistry.getTaxonomyRegistryStatistics().then(useCaseResult);
  }
}
