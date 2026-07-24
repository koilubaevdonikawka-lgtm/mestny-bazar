import { ProductLifecycleViolationError } from "@server/domain/product/exceptions/product.errors";

/** Canonical product lifecycle statuses. */
export const ProductStatus = {
  Draft: "Draft",
  PendingReview: "PendingReview",
  ReadyForPublication: "ReadyForPublication",
  Published: "Published",
  Hidden: "Hidden",
  Archived: "Archived",
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const PRODUCT_STATUS_VALUES: readonly ProductStatus[] = Object.values(ProductStatus);

export function isProductStatus(value: string): value is ProductStatus {
  return PRODUCT_STATUS_VALUES.includes(value as ProductStatus);
}

export function assertProductStatus(value: string): ProductStatus {
  if (!isProductStatus(value)) {
    throw new ProductLifecycleViolationError(
      `Unknown product status: ${value}`,
      value,
      value,
    );
  }
  return value;
}

export function isTerminalProductStatus(status: ProductStatus): boolean {
  return status === ProductStatus.Archived;
}

export function isPubliclyVisibleStatus(status: ProductStatus): boolean {
  return status === ProductStatus.Published;
}
