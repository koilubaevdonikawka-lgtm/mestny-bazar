import type { ICatalogStore } from "@server/application/modules/catalog/catalog/contracts";
import type {
  CreateCategoryDto,
  MoveCategoryDto,
  PublishCategoryDto,
  UpdateCategoryDto,
} from "@server/application/modules/catalog/catalog/dto";
import {
  createCategoryCreatedEvent,
  createCategoryMovedEvent,
  createCategoryPublishedEvent,
  createCategoryUpdatedEvent,
} from "@server/application/modules/catalog/catalog/events";
import {
  buildCategoryTree,
  CatalogVisibility,
  collectCategoryDescendantIds,
  createCatalog,
  createCategory,
  isPublishedCatalogVisibility,
  slugifyCategoryName,
  updateCategoryDetails,
  withCatalogRootCategories,
  withCategoryChildren,
  withCategoryParent,
  withCategoryVisibility,
  type Catalog,
  type Category,
  type CategoryTree,
} from "@server/application/modules/catalog/catalog/models";
import type { IIdGenerator } from "@server/application/ports";

/** Catalog business capability service — orchestrates catalog structure via ICatalogStore. */
export class CatalogService {
  constructor(
    private readonly store: ICatalogStore,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    validateCreateCategoryDto(dto);

    const catalog = await this.requireCatalog(dto.catalogId);
    const parent = dto.parentId ? await this.requireCategory(dto.parentId) : null;

    if (parent && parent.catalogId !== catalog.id) {
      throw new Error(`Parent category ${dto.parentId} does not belong to catalog ${catalog.id}.`);
    }

    const categoryId = this.idGenerator.generate();
    const slug = dto.slug?.trim() || slugifyCategoryName(dto.name);
    const category = createCategory({
      id: categoryId,
      catalogId: catalog.id,
      name: dto.name,
      slug,
      description: dto.description,
      parentId: dto.parentId,
      sortOrder: dto.sortOrder,
    });

    await this.store.saveCategory(category);

    if (parent) {
      await this.store.updateCategory(
        withCategoryChildren(parent, [...parent.childrenIds, category.id]),
      );
    } else {
      await this.store.updateCatalog(
        withCatalogRootCategories(catalog, [...catalog.rootCategoryIds, category.id]),
      );
    }

    createCategoryCreatedEvent(category);
    return category;
  }

  async updateCategory(dto: UpdateCategoryDto): Promise<Category> {
    validateUpdateCategoryDto(dto);

    const category = await this.requireCategory(dto.categoryId);
    const slug = dto.slug?.trim() || slugifyCategoryName(dto.name);
    const updated = updateCategoryDetails(category, {
      name: dto.name,
      slug,
      description: dto.description,
      sortOrder: dto.sortOrder,
    });

    await this.store.updateCategory(updated);
    createCategoryUpdatedEvent(updated);

    return updated;
  }

  async moveCategory(dto: MoveCategoryDto): Promise<Category> {
    const category = await this.requireCategory(dto.categoryId);
    const previousParentId = category.parentId;

    if (previousParentId === dto.newParentId) {
      if (dto.sortOrder === undefined) {
        return category;
      }

      const reordered = withCategoryParent(category, previousParentId, dto.sortOrder);
      await this.store.updateCategory(reordered);
      createCategoryMovedEvent(reordered, previousParentId);
      return reordered;
    }

    if (dto.newParentId === category.id) {
      throw new Error("Category cannot be moved under itself.");
    }

    const categories = await this.store.findCategoriesByCatalogId(category.catalogId);
    const descendants = collectCategoryDescendantIds(category.id, categories);
    if (dto.newParentId && descendants.includes(dto.newParentId)) {
      throw new Error(`Category ${dto.categoryId} cannot be moved under its descendant ${dto.newParentId}.`);
    }

    const newParent = dto.newParentId ? await this.requireCategory(dto.newParentId) : null;
    if (newParent && newParent.catalogId !== category.catalogId) {
      throw new Error(`Target parent ${dto.newParentId} belongs to another catalog.`);
    }

    const catalog = await this.requireCatalog(category.catalogId);
    const previousParent = previousParentId
      ? await this.requireCategory(previousParentId)
      : null;

    if (previousParent) {
      await this.store.updateCategory(
        withCategoryChildren(
          previousParent,
          previousParent.childrenIds.filter((childId) => childId !== category.id),
        ),
      );
    } else {
      await this.store.updateCatalog(
        withCatalogRootCategories(
          catalog,
          catalog.rootCategoryIds.filter((rootId) => rootId !== category.id),
        ),
      );
    }

    if (newParent) {
      await this.store.updateCategory(
        withCategoryChildren(newParent, [...newParent.childrenIds, category.id]),
      );
    } else {
      await this.store.updateCatalog(
        withCatalogRootCategories(catalog, [...catalog.rootCategoryIds, category.id]),
      );
    }

    const moved = withCategoryParent(category, dto.newParentId, dto.sortOrder);
    await this.store.updateCategory(moved);
    createCategoryMovedEvent(moved, previousParentId);

    return moved;
  }

  async publishCategory(dto: PublishCategoryDto): Promise<Category> {
    const category = await this.requireCategory(dto.categoryId);
    if (category.visibility === CatalogVisibility.Published) {
      return category;
    }

    const published = withCategoryVisibility(category, CatalogVisibility.Published);
    await this.store.updateCategory(published);
    createCategoryPublishedEvent(published);

    return published;
  }

  async getCategory(categoryId: string): Promise<Category | null> {
    return this.store.findCategoryById(categoryId.trim());
  }

  async getCategoryTree(catalogId: string): Promise<CategoryTree> {
    const catalog = await this.requireCatalog(catalogId);
    const categories = await this.store.findCategoriesByCatalogId(catalog.id);
    return buildCategoryTree(catalog.id, categories);
  }

  async isCategoryPublished(categoryId: string): Promise<boolean> {
    const category = await this.store.findCategoryById(categoryId.trim());
    return category ? isPublishedCatalogVisibility(category.visibility) : false;
  }

  private async requireCatalog(catalogId: string): Promise<Catalog> {
    const normalizedId = catalogId.trim();
    let catalog = await this.store.findCatalogById(normalizedId);
    if (!catalog) {
      catalog = createCatalog({
        id: normalizedId,
        name: normalizedId,
      });
      await this.store.saveCatalog(catalog);
    }
    return catalog;
  }

  private async requireCategory(categoryId: string): Promise<Category> {
    const category = await this.store.findCategoryById(categoryId.trim());
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }
    return category;
  }
}

function validateCreateCategoryDto(dto: CreateCategoryDto): void {
  if (!dto.catalogId?.trim()) {
    throw new Error("Catalog id is required.");
  }
  if (!dto.name?.trim()) {
    throw new Error("Category name is required.");
  }
}

function validateUpdateCategoryDto(dto: UpdateCategoryDto): void {
  if (!dto.categoryId?.trim()) {
    throw new Error("Category id is required.");
  }
  if (!dto.name?.trim()) {
    throw new Error("Category name is required.");
  }
}
