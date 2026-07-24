import type { CreateCategoryDto } from "@server/application/dto";
import { CreateCategoryCommand } from "@server/application/commands";
import { GetCatalogQuery } from "@server/application/queries";
import type { IIdGenerator } from "@server/application/ports";
import {
  CreateCategoryUseCase,
  GetCatalogUseCase,
} from "@server/application/use-cases";
import type { CatalogReadModel, CategoryReadModel } from "@server/domain/catalog";

/** Catalog application facade — orchestrates use cases without domain logic. */
export class CatalogApplicationService {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCatalogUseCase: GetCatalogUseCase,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<CategoryReadModel> {
    const categoryId = this.idGenerator.generate();
    const command = CreateCategoryCommand.create(categoryId, dto);
    const result = await this.createCategoryUseCase.execute(command);
    return result.value;
  }

  async getCatalog(catalogId: string): Promise<CatalogReadModel | null> {
    const query = GetCatalogQuery.create(catalogId);
    const result = await this.getCatalogUseCase.execute(query);
    return result.value;
  }
}
