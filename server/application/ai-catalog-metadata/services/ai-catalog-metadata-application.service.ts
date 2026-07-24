import type {
  RegisterCatalogMetadataInput,
  UpdateCatalogMetadataInput,
} from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";
import {
  DeleteCatalogMetadataUseCase,
  FindCatalogMetadataByNameUseCase,
  GetCatalogMetadataStatisticsUseCase,
  GetCatalogMetadataUseCase,
  ListCatalogMetadataByCategoryUseCase,
  ListCatalogMetadataUseCase,
  RegisterCatalogMetadataUseCase,
  UpdateCatalogMetadataUseCase,
} from "@server/application/ai-catalog-metadata/use-cases/ai-catalog-metadata.use-cases";

/** Application facade for AI Catalog Metadata scenario. */
export class AiCatalogMetadataApplicationService {
  constructor(
    private readonly registerCatalogMetadataUseCase: RegisterCatalogMetadataUseCase,
    private readonly getCatalogMetadataUseCase: GetCatalogMetadataUseCase,
    private readonly listCatalogMetadataUseCase: ListCatalogMetadataUseCase,
    private readonly updateCatalogMetadataUseCase: UpdateCatalogMetadataUseCase,
    private readonly deleteCatalogMetadataUseCase: DeleteCatalogMetadataUseCase,
    private readonly findCatalogMetadataByNameUseCase: FindCatalogMetadataByNameUseCase,
    private readonly listCatalogMetadataByCategoryUseCase: ListCatalogMetadataByCategoryUseCase,
    private readonly getCatalogMetadataStatisticsUseCase: GetCatalogMetadataStatisticsUseCase,
  ) {}

  registerCatalogMetadata(input: RegisterCatalogMetadataInput) {
    return this.registerCatalogMetadataUseCase.execute(input);
  }

  getCatalogMetadata(metadataId: string) {
    return this.getCatalogMetadataUseCase.execute(metadataId);
  }

  listCatalogMetadata() {
    return this.listCatalogMetadataUseCase.execute();
  }

  updateCatalogMetadata(input: UpdateCatalogMetadataInput) {
    return this.updateCatalogMetadataUseCase.execute(input);
  }

  deleteCatalogMetadata(metadataId: string) {
    return this.deleteCatalogMetadataUseCase.execute(metadataId);
  }

  findCatalogMetadataByName(name: string) {
    return this.findCatalogMetadataByNameUseCase.execute(name);
  }

  listCatalogMetadataByCategory(category: string) {
    return this.listCatalogMetadataByCategoryUseCase.execute(category);
  }

  getCatalogMetadataStatistics() {
    return this.getCatalogMetadataStatisticsUseCase.execute();
  }
}
