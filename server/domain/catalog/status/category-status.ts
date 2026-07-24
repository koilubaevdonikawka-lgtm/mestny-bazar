import { CategoryLifecycleViolationError } from "@server/domain/catalog/exceptions/catalog.errors";

/** Canonical category lifecycle statuses. */
export const CategoryLifecycleStatus = {
  Draft: "Draft",
  Hidden: "Hidden",
  Visible: "Visible",
  Archived: "Archived",
} as const;

export type CategoryLifecycleStatus =
  (typeof CategoryLifecycleStatus)[keyof typeof CategoryLifecycleStatus];

export const CATEGORY_LIFECYCLE_STATUS_VALUES: readonly CategoryLifecycleStatus[] =
  Object.values(CategoryLifecycleStatus);

export function isCategoryLifecycleStatus(value: string): value is CategoryLifecycleStatus {
  return CATEGORY_LIFECYCLE_STATUS_VALUES.includes(value as CategoryLifecycleStatus);
}

export function assertCategoryLifecycleStatus(value: string): CategoryLifecycleStatus {
  if (!isCategoryLifecycleStatus(value)) {
    throw new CategoryLifecycleViolationError(`Unknown category status: ${value}`, value, value);
  }
  return value;
}

export function isTerminalCategoryStatus(status: CategoryLifecycleStatus): boolean {
  return status === CategoryLifecycleStatus.Archived;
}

export function isPublicCategoryStatus(status: CategoryLifecycleStatus): boolean {
  return status === CategoryLifecycleStatus.Visible;
}
