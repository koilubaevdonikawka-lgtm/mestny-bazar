import type { CreateCategoryCommand } from "@server/application/commands";
import { DomainEventDispatcher } from "@server/application/events";
import type {
  ICatalogRepository,
  ICategoryRepository,
  ITransactionManager,
} from "@server/application/ports";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import { Category, type CategoryReadModel } from "@server/domain/catalog";

export class CreateCategoryUseCase {
  constructor(
    private readonly categories: ICategoryRepository,
    private readonly catalogs: ICatalogRepository,
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<UseCaseResult<CategoryReadModel>> {
    return this.transactionManager.execute(async () => {
      const catalog = await this.catalogs.findById(command.dto.catalogId);
      if (!catalog) {
        throw new Error(`Catalog not found: ${command.dto.catalogId}`);
      }

      const category = Category.create({
        id: command.categoryId,
        catalogId: command.dto.catalogId,
        name: command.dto.name,
        slug: command.dto.slug,
        parentId: command.dto.parentId,
        parentPath: command.dto.parentPath,
        sortOrder: command.dto.sortOrder,
        seo: command.dto.seo,
        metadata: command.dto.metadata,
        hierarchyContext: {
          categoryId: command.categoryId,
          catalogId: command.dto.catalogId,
          newParentId: command.dto.parentId?.trim() ?? null,
          newPath: "/",
          newDepth: 0,
          existingPaths: command.dto.hierarchy.existingPaths,
          ancestorIds: command.dto.hierarchy.ancestorIds,
          maxDepth: command.dto.hierarchy.maxDepth,
        },
      });

      if (!command.dto.parentId) {
        catalog.registerRootCategory(category.snapshot().id);
        await this.catalogs.save(catalog);
        await this.eventDispatcher.dispatchFrom(catalog, "Catalog");
      }

      await this.categories.save(category);
      await this.eventDispatcher.dispatchFrom(category, "Category");

      return useCaseResult(category.snapshot().toJSON());
    });
  }
}
