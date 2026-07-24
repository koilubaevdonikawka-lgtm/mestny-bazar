import type { IPricingStore } from "@server/application/modules/pricing/pricing/contracts";
import type {
  Discount,
  Price,
  PriceRule,
  Promotion,
} from "@server/application/modules/pricing/pricing/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory pricing store for development and tests. */
export class MemoryPricingStore implements IPricingStore {
  private readonly prices = new InMemoryStore<Price>((price) => price.productId);
  private readonly priceRules = new InMemoryStore<PriceRule>((rule) => rule.id);
  private readonly priceRulesByProduct = new Map<string, Set<string>>();
  private readonly discounts = new InMemoryStore<Discount>((discount) => discount.id);
  private readonly promotions = new InMemoryStore<Promotion>((promotion) => promotion.id);

  async savePrice(price: Price): Promise<void> {
    this.prices.set(price);
  }

  async updatePrice(price: Price): Promise<void> {
    if (!this.prices.has(price.productId)) {
      throw new Error(`Price not found for product ${price.productId}.`);
    }
    this.prices.set(price);
  }

  async findCurrentPriceByProductId(productId: string): Promise<Price | null> {
    return this.prices.get(productId) ?? null;
  }

  async savePriceRule(rule: PriceRule): Promise<void> {
    this.priceRules.set(rule);
    const bucket = this.priceRulesByProduct.get(rule.productId) ?? new Set<string>();
    bucket.add(rule.id);
    this.priceRulesByProduct.set(rule.productId, bucket);
  }

  async findActivePriceRulesByProductId(productId: string): Promise<readonly PriceRule[]> {
    const ids = this.priceRulesByProduct.get(productId);
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((ruleId) => this.priceRules.get(ruleId))
        .filter((rule): rule is PriceRule => rule !== undefined && rule.active),
    );
  }

  async saveDiscount(discount: Discount): Promise<void> {
    this.discounts.set(discount);
  }

  async findDiscountById(discountId: string): Promise<Discount | null> {
    return this.discounts.get(discountId) ?? null;
  }

  async savePromotion(promotion: Promotion): Promise<void> {
    this.promotions.set(promotion);
  }

  async findPromotionById(promotionId: string): Promise<Promotion | null> {
    return this.promotions.get(promotionId) ?? null;
  }
}
