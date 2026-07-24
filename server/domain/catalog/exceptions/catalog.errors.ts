/** Catalog domain error base. */
export abstract class CatalogDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCatalogIdError extends CatalogDomainError {
  readonly code = "INVALID_CATALOG_ID";
  constructor(message = "Catalog id must be a non-empty string") {
    super(message);
  }
}

export class InvalidCatalogNameError extends CatalogDomainError {
  readonly code = "INVALID_CATALOG_NAME";
  constructor(message = "Catalog name must be between 2 and 200 characters") {
    super(message);
  }
}

export class InvalidCatalogDescriptionError extends CatalogDomainError {
  readonly code = "INVALID_CATALOG_DESCRIPTION";
  constructor(message = "Catalog description must not exceed 2000 characters") {
    super(message);
  }
}

export class InvalidCategoryIdError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_ID";
  constructor(message = "Category id must be a non-empty string") {
    super(message);
  }
}

export class InvalidCategoryNameError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_NAME";
  constructor(message = "Category name must be between 2 and 200 characters") {
    super(message);
  }
}

export class InvalidCategorySlugError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_SLUG";
  constructor(message = "Category slug must be a valid URL segment") {
    super(message);
  }
}

export class InvalidCategoryPathError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_PATH";
  constructor(message = "Category path is invalid") {
    super(message);
  }
}

export class InvalidCategorySortOrderError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_SORT_ORDER";
  constructor(message = "Category sort order must be a non-negative integer") {
    super(message);
  }
}

export class InvalidCategoryVisibilityError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_VISIBILITY";
  constructor(message = "Category visibility settings are invalid") {
    super(message);
  }
}

export class InvalidCategorySeoError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_SEO";
  constructor(message = "Category SEO metadata is invalid") {
    super(message);
  }
}

export class InvalidCategoryMetadataError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_METADATA";
  constructor(message = "Category metadata is invalid") {
    super(message);
  }
}

export class InvalidCategoryStatusError extends CatalogDomainError {
  readonly code = "INVALID_CATEGORY_STATUS";
  constructor(message = "Category lifecycle status is invalid") {
    super(message);
  }
}

export class CategoryLifecycleViolationError extends CatalogDomainError {
  readonly code = "CATEGORY_LIFECYCLE_VIOLATION";
  constructor(
    message: string,
    public readonly fromStatus: string,
    public readonly toStatus: string,
  ) {
    super(message);
  }
}

export class CatalogPolicyViolationError extends CatalogDomainError {
  readonly code = "CATALOG_POLICY_VIOLATION";
  constructor(
    message: string,
    public readonly action: string,
  ) {
    super(message);
  }
}

export class CategoryHierarchyViolationError extends CatalogDomainError {
  readonly code = "CATEGORY_HIERARCHY_VIOLATION";
  constructor(
    message: string,
    public readonly reason: string,
  ) {
    super(message);
  }
}

export class CatalogInvariantViolationError extends CatalogDomainError {
  readonly code = "CATALOG_INVARIANT_VIOLATION";
  constructor(message: string) {
    super(message);
  }
}
