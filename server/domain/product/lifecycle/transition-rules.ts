import { ProductStatus } from "@server/domain/product/status/product-status";
import type { ProductLifecycleAction } from "@server/domain/product/lifecycle/product-lifecycle.types";

export type ProductTransitionMatrix = Record<
  ProductStatus,
  Partial<Record<ProductLifecycleAction, ProductStatus>>
>;

/** Pure transition rules — independent from future state objects. */
export const PRODUCT_TRANSITION_RULES: ProductTransitionMatrix = {
  [ProductStatus.Draft]: {
    submit_for_review: ProductStatus.PendingReview,
    archive: ProductStatus.Archived,
  },
  [ProductStatus.PendingReview]: {
    approve_for_publication: ProductStatus.ReadyForPublication,
    reject_review: ProductStatus.Draft,
    archive: ProductStatus.Archived,
  },
  [ProductStatus.ReadyForPublication]: {
    publish: ProductStatus.Published,
    reject_review: ProductStatus.PendingReview,
    archive: ProductStatus.Archived,
  },
  [ProductStatus.Published]: {
    hide: ProductStatus.Hidden,
    archive: ProductStatus.Archived,
  },
  [ProductStatus.Hidden]: {
    unhide: ProductStatus.Published,
    archive: ProductStatus.Archived,
  },
  [ProductStatus.Archived]: {},
};

export class ProductTransitionRules {
  static resolve(
    current: ProductStatus,
    action: ProductLifecycleAction,
  ): ProductStatus | undefined {
    return PRODUCT_TRANSITION_RULES[current][action];
  }

  static canResolve(current: ProductStatus, action: ProductLifecycleAction): boolean {
    return ProductTransitionRules.resolve(current, action) !== undefined;
  }
}
