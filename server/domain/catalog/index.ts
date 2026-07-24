export {
  Catalog,
  type CreateCatalogProps,
  type ReconstituteCatalogProps,
  type CatalogReadModel,
} from "./aggregate";
export {
  Category,
  type CreateCategoryProps,
  type ReconstituteCategoryProps,
  type CategoryReadModel,
  type CategoryVisibilityInput,
} from "./category";
export { CatalogSnapshot } from "./snapshot/catalog-snapshot";
export { CategorySnapshot } from "./snapshot/category-snapshot";
export {
  CatalogId,
  CatalogName,
  CatalogDescription,
  CategoryId,
  CategoryName,
  CategorySlug,
  CategoryPath,
  CategorySortOrder,
  CategoryVisibility,
  CategorySeo,
  CategoryMetadata,
  CategoryStatus,
} from "./value-objects";
export {
  CategoryLifecycleStatus,
  CATEGORY_LIFECYCLE_STATUS_VALUES,
  isCategoryLifecycleStatus,
  isTerminalCategoryStatus,
  isPublicCategoryStatus,
} from "./status/category-status";
export { CategoryLifecycle, type CategoryLifecycleAction } from "./lifecycle/category-lifecycle";
export { CategoryTransitionRules, CATEGORY_TRANSITION_RULES } from "./lifecycle/transition-rules";
export {
  CategoryStateBehaviorRegistry,
  type CategoryStateBehavior,
} from "./lifecycle/state-behavior";
export {
  CatalogPolicy,
  CategoryVisibilityPolicy,
  CategoryHierarchyPolicy,
  CategoryPublishingPolicy,
  DEFAULT_MAX_CATEGORY_DEPTH,
  type CategoryPolicySnapshot,
  type CategoryHierarchyContext,
  type CategoryVisibilityContext,
} from "./policies/catalog.policy";
export { DomainEvent } from "./events/domain-event.base";
export {
  CatalogCreatedEvent,
  CatalogUpdatedEvent,
  CategoryCreatedEvent,
  CategoryUpdatedEvent,
  CategoryMovedEvent,
  CategoryHiddenEvent,
  CategoryVisibleEvent,
  CategoryArchivedEvent,
  CategoryRestoredEvent,
  type CatalogDomainEvent,
  type CategoryDomainEvent,
  type CatalogModuleDomainEvent,
  type CatalogModuleDomainEventType,
} from "./events/catalog.events";
export {
  CatalogDomainError,
  InvalidCatalogIdError,
  InvalidCatalogNameError,
  InvalidCatalogDescriptionError,
  InvalidCategoryIdError,
  InvalidCategoryNameError,
  InvalidCategorySlugError,
  InvalidCategoryPathError,
  InvalidCategorySortOrderError,
  InvalidCategoryVisibilityError,
  InvalidCategorySeoError,
  InvalidCategoryMetadataError,
  InvalidCategoryStatusError,
  CategoryLifecycleViolationError,
  CatalogPolicyViolationError,
  CategoryHierarchyViolationError,
  CatalogInvariantViolationError,
} from "./exceptions/catalog.errors";
