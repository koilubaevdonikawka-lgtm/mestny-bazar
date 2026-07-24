import type {
  Discount,
  Price,
  PriceRule,
  Promotion,
} from "@server/application/modules/pricing/pricing/models";

/** Pricing persistence contract — implemented by infrastructure adapters. */
export interface IPricingStore {
  savePrice(price: Price): Promise<void>;
  updatePrice(price: Price): Promise<void>;
  findCurrentPriceByProductId(productId: string): Promise<Price | null>;
  savePriceRule(rule: PriceRule): Promise<void>;
  findActivePriceRulesByProductId(productId: string): Promise<readonly PriceRule[]>;
  saveDiscount(discount: Discount): Promise<void>;
  findDiscountById(discountId: string): Promise<Discount | null>;
  savePromotion(promotion: Promotion): Promise<void>;
  findPromotionById(promotionId: string): Promise<Promotion | null>;
}
