import type {
  CatalogMetadata,
  CatalogMetadataStatistics,
  DeleteCatalogMetadataResult,
  FindCatalogMetadataByNameResult,
  ListCatalogMetadataByCategoryResult,
  ListCatalogMetadataResult,
  RegisterCatalogMetadataInput,
  UpdateCatalogMetadataInput,
} from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";
import type { AiCatalogMetadataService } from "@server/application/ai-catalog-metadata/services/ai-catalog-metadata.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterCatalogMetadataUseCase {
  constructor(private readonly catalogMetadata: AiCatalogMetadataService) {}

  execute(input: RegisterCatalogMetadataInput): Promise<UseCaseResult<CatalogMetadata>> {
    return this.catalogMetadata.registerCatalogMetadata(input).then(useCaseResult);
  }
}

export class GetCatalogMetadataUseCase {
  constructor(private readonly catalogMetadata: AiCatalogMetadataService) {}

  execute(metadataId: string): Promise<UseCaseResult<CatalogMetadata | null>> {
    return this.catalogMetadata.getCatalogMetadata(metadataId).then(useCaseResult);
  }
}

export class ListCatalogMetadataUseCase {
  constructor(private readonly catalogMetadata: AiCatalogMetadataService) {}

  execute(): Promise<UseCaseResult<ListCatalogMetadataResult>> {
    return this.catalogMetadata.listCatalogMetadata().then(useCaseResult);
  }
}

export class UpdateCatalogMetadataUseCase {
  constructor(private readonly catalogMetadata: AiCatalogMetadataService) {}

  execute(input: UpdateCatalogMetadataInput): Promise<UseCaseResult<CatalogMetadata>> {
    return this.catalogMetadata.updateCatalogMetadata(input).then(useCaseResult);
  }
}

export class DeleteCatalogMetadataUseCase {
  constructor(private readonly catalogMetadata: AiCatalogMetadataService) {}

  execute(metadataId: string): Promise<UseCaseResult<DeleteCatalogMetadataResult>> {
    return this.catalogMetadata.deleteCatalogMetadata(metadataId).then(useCaseResult);
  }
}

export class FindCatalogMetadataByNameUseCase {
  constructor(private readonly catalogMetadata: AiCatalogMetadataService) {}

  execute(name: string): Promise<UseCaseResult<FindCatalogMetadataByNameResult>> {
    return this.catalogMetadata.findCatalogMetadataByName(name).then(useCaseResult);
  }
}

export class ListCatalogMetadataByCategoryUseCase {
  constructor(private readonly catalogMetadata: AiCatalogMetadataService) {}

  execute(category: string): Promise<UseCaseResult<ListCatalogMetadataByCategoryResult>> {
    return this.catalogMetadata.listCatalogMetadataByCategory(category).then(useCaseResult);
  }
}

export class GetCatalogMetadataStatisticsUseCase {
  constructor(private readonly catalogMetadata: AiCatalogMetadataService) {}

  execute(): Promise<UseCaseResult<CatalogMetadataStatistics>> {
    return this.catalogMetadata.getCatalogMetadataStatistics().then(useCaseResult);
  }
}
