import type {
  CreateCategoryDto,
  MoveCategoryDto,
  PublishCategoryDto,
  UpdateCategoryDto,
} from "@server/application/modules/catalog/catalog/dto";
import type { Category, CategoryTree } from "@server/application/modules/catalog/catalog/models";
import type { CatalogService } from "@server/application/modules/catalog/catalog/services";

/** Public entry point for the Catalog business capability module. */
export class CatalogModule {
  constructor(private readonly service: CatalogService) {}

  createCategory(dto: CreateCategoryDto): Promise<Category> {
    return this.service.createCategory(dto);
  }

  updateCategory(dto: UpdateCategoryDto): Promise<Category> {
    return this.service.updateCategory(dto);
  }

  moveCategory(dto: MoveCategoryDto): Promise<Category> {
    return this.service.moveCategory(dto);
  }

  publishCategory(dto: PublishCategoryDto): Promise<Category> {
    return this.service.publishCategory(dto);
  }

  getCategory(categoryId: string): Promise<Category | null> {
    return this.service.getCategory(categoryId);
  }

  getCategoryTree(catalogId: string): Promise<CategoryTree> {
    return this.service.getCategoryTree(catalogId);
  }

  isCategoryPublished(categoryId: string): Promise<boolean> {
    return this.service.isCategoryPublished(categoryId);
  }
}
