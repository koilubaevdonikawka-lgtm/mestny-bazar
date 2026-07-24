import {
  isStockAvailableForSale,
  ProductStatus,
  type Product,
  type ProductStatusValue,
} from "@server/application/modules/product/product/models";

/** Product capability business rules — mirrors domain publication and edit policies. */
export class ProductPolicy {
  canEdit(product: Product): boolean {
    return (
      product.status === ProductStatus.Draft ||
      product.status === ProductStatus.PendingReview ||
      product.status === ProductStatus.ReadyForPublication ||
      product.status === ProductStatus.Hidden ||
      product.status === ProductStatus.Published
    );
  }

  canChangePrice(product: Product): boolean {
    return this.canEdit(product) && product.status !== ProductStatus.Archived;
  }

  canChangeStock(product: Product): boolean {
    return this.canEdit(product) && product.status !== ProductStatus.Archived;
  }

  canPublish(product: Product): boolean {
    if (product.status !== ProductStatus.ReadyForPublication) {
      return false;
    }

    return product.media.length >= 1 && isStockAvailableForSale(product.stock);
  }

  advanceStatusForPublication(current: ProductStatusValue): ProductStatusValue {
    switch (current) {
      case ProductStatus.Draft:
        return ProductStatus.PendingReview;
      case ProductStatus.PendingReview:
        return ProductStatus.ReadyForPublication;
      case ProductStatus.ReadyForPublication:
        return ProductStatus.ReadyForPublication;
      default:
        return current;
    }
  }
}
