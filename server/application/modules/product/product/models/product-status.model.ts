/** Canonical product lifecycle statuses for the Product capability module. */
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
    throw new Error(`Unknown product status: ${value}`);
  }
  return value;
}

export function isPubliclyVisibleProductStatus(status: ProductStatus): boolean {
  return status === ProductStatus.Published;
}
