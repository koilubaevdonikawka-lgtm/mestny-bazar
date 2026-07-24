import type { SellerLimits } from "@server/domain/seller/value-objects/seller-limits.vo";

export interface SellerLimitsUsage {
  productCount: number;
  publishedProductCount: number;
  imageCount: number;
  categoryCount: number;
}

/** Enforces seller quota limits with extension support. */
export class SellerLimitsPolicy {
  canCreateProduct(limits: SellerLimits, usage: SellerLimitsUsage): boolean {
    return limits.canAddProduct(usage.productCount);
  }

  canPublishProduct(limits: SellerLimits, usage: SellerLimitsUsage): boolean {
    return limits.canPublishProduct(usage.publishedProductCount);
  }

  canAddImage(limits: SellerLimits, usage: SellerLimitsUsage): boolean {
    return limits.canAddImage(usage.imageCount);
  }

  canUseCategory(limits: SellerLimits, usage: SellerLimitsUsage): boolean {
    return limits.canUseCategory(usage.categoryCount);
  }

  canUseExtension(limits: SellerLimits, key: string, currentValue: number): boolean {
    const limit = limits.extensionLimit(key);
    if (limit === undefined) {
      return true;
    }
    return currentValue < limit;
  }
}
