export class CategoryNotFoundError extends Error {
  constructor() {
    super("Category not found");
    this.name = "CategoryNotFoundError";
  }
}

export class CategoryValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "CategoryValidationError";
  }
}

/** Thrown by deleteCategory when the category still has subcategories —
 * deleting it would silently promote them to top-level (parent_id ON DELETE
 * SET NULL), collapsing the hierarchy without confirmation. */
export class CategoryHasChildrenError extends Error {
  constructor() {
    super("Cannot delete a category that still has subcategories");
    this.name = "CategoryHasChildrenError";
  }
}
