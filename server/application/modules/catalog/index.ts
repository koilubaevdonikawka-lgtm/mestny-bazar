export { CatalogModule } from "./catalog";
export type { ICatalogStore } from "./catalog/contracts";
export type {
  CreateCategoryDto,
  UpdateCategoryDto,
  MoveCategoryDto,
  PublishCategoryDto,
} from "./catalog/dto";
export {
  type CategoryCreatedEvent,
  type CategoryUpdatedEvent,
  type CategoryMovedEvent,
  type CategoryPublishedEvent,
  createCategoryCreatedEvent,
  createCategoryUpdatedEvent,
  createCategoryMovedEvent,
  createCategoryPublishedEvent,
} from "./catalog/events";
export {
  CatalogVisibility,
  CATALOG_VISIBILITY_VALUES,
  isCatalogVisibility,
  assertCatalogVisibility,
  isPublishedCatalogVisibility,
  type CatalogVisibilityValue,
  type Catalog,
  type Category,
  type CategoryTree,
  type CategoryTreeNode,
  createCatalog,
  createCategory,
  updateCategoryDetails,
  withCatalogRootCategories,
  withCatalogDetails,
  withCategoryParent,
  withCategoryChildren,
  withCategoryVisibility,
  slugifyCategoryName,
  buildCategoryTree,
  collectCategoryDescendantIds,
} from "./catalog/models";
export { CatalogService } from "./catalog/services";
