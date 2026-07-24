import type { IPricingStore } from "@server/application/modules/pricing/pricing/contracts";
import type {
  ApplyDiscountDto,
  ApplyPromotionDto,
  CalculatePriceDto,
  CreateDiscountDto,
  CreatePriceDto,
  CreatePromotionDto,
  UpdatePriceDto,
} from "@server/application/modules/pricing/pricing/dto";
import {
  createDiscountCreatedEvent,
  createPriceCalculatedEvent,
  createPriceCreatedEvent,
  createPriceUpdatedEvent,
  createPromotionCreatedEvent,
} from "@server/application/modules/pricing/pricing/events";
import {
  calculateDiscountAmount,
  calculatePromotionAmount,
  createDiscount,
  createPrice,
  createPriceCalculation,
  createPromotion,
  toPriceAmount,
  updatePriceAmount,
  type Price,
  type PriceAmount,
  type PriceCalculation,
  type Discount,
  type Promotion,
} from "@server/application/modules/pricing/pricing/models";
import type { IIdGenerator } from "@server/application/ports";

/** Pricing business capability service — orchestrates prices via IPricingStore. */
export class PricingService {
  constructor(
    private readonly store: IPricingStore,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createPrice(dto: CreatePriceDto): Promise<Price> {
    validateProductId(dto.productId);

    const existing = await this.store.findCurrentPriceByProductId(dto.productId);
    if (existing) {
      throw new Error(`Price already exists for product ${dto.productId}.`);
    }

    const price = createPrice({
      id: this.idGenerator.generate(),
      productId: dto.productId,
      amount: dto.amount,
      currency: dto.currency,
    });

    await this.store.savePrice(price);
    createPriceCreatedEvent(price);

    return price;
  }

  async updatePrice(dto: UpdatePriceDto): Promise<Price> {
    validateProductId(dto.productId);

    const existing = await this.requireCurrentPrice(dto.productId);
    const updated = updatePriceAmount(existing, dto.amount, dto.currency);

    await this.store.updatePrice(updated);
    createPriceUpdatedEvent(updated);

    return updated;
  }

  async getCurrentPrice(productId: string): Promise<PriceAmount | null> {
    const price = await this.store.findCurrentPriceByProductId(productId.trim());
    return price ? toPriceAmount(price) : null;
  }

  async calculatePrice(dto: CalculatePriceDto): Promise<PriceCalculation> {
    return this.buildCalculation(dto);
  }

  async applyDiscount(dto: ApplyDiscountDto): Promise<PriceCalculation> {
    return this.buildCalculation({
      productId: dto.productId,
      quantity: dto.quantity,
      currency: dto.currency,
      discountId: dto.discountId,
    });
  }

  async applyPromotion(dto: ApplyPromotionDto): Promise<PriceCalculation> {
    return this.buildCalculation({
      productId: dto.productId,
      quantity: dto.quantity,
      currency: dto.currency,
      promotionId: dto.promotionId,
    });
  }

  async createDiscount(dto: CreateDiscountDto): Promise<Discount> {
    const discount = createDiscount({
      id: this.idGenerator.generate(),
      code: dto.code,
      productId: dto.productId,
      percentage: dto.percentage,
      fixedAmount: dto.fixedAmount,
      currency: dto.currency,
    });

    await this.store.saveDiscount(discount);
    createDiscountCreatedEvent(discount);

    return discount;
  }

  async createPromotion(dto: CreatePromotionDto): Promise<Promotion> {
    const promotion = createPromotion({
      id: this.idGenerator.generate(),
      name: dto.name,
      productId: dto.productId,
      percentage: dto.percentage,
      fixedAmount: dto.fixedAmount,
      currency: dto.currency,
    });

    await this.store.savePromotion(promotion);
    createPromotionCreatedEvent(promotion);

    return promotion;
  }

  private async buildCalculation(dto: CalculatePriceDto): Promise<PriceCalculation> {
    validateProductId(dto.productId);
    if (!Number.isInteger(dto.quantity) || dto.quantity < 1) {
      throw new Error("Quantity must be a positive integer.");
    }

    const price = await this.requireCurrentPrice(dto.productId);
    const unitPrice = toPriceAmount(price);
    const currency = dto.currency?.trim().toUpperCase() || unitPrice.currency;

    if (currency !== unitPrice.currency) {
      throw new Error(`Price currency mismatch for product ${dto.productId}.`);
    }

    const subtotal = Number((unitPrice.amount * dto.quantity).toFixed(2));
    let discountAmount = 0;
    let promotionAmount = 0;

    if (dto.discountId) {
      const discount = await this.requireDiscount(dto.discountId);
      if (discount.productId && discount.productId !== dto.productId) {
        throw new Error(`Discount ${dto.discountId} does not apply to product ${dto.productId}.`);
      }
      discountAmount = calculateDiscountAmount(discount, subtotal);
    }

    if (dto.promotionId) {
      const promotion = await this.requirePromotion(dto.promotionId);
      if (promotion.productId && promotion.productId !== dto.productId) {
        throw new Error(`Promotion ${dto.promotionId} does not apply to product ${dto.productId}.`);
      }
      promotionAmount = calculatePromotionAmount(promotion, subtotal);
    }

    const calculation = createPriceCalculation({
      productId: dto.productId,
      quantity: dto.quantity,
      unitPrice,
      discountAmount,
      promotionAmount,
    });

    createPriceCalculatedEvent(calculation);
    return calculation;
  }

  private async requireCurrentPrice(productId: string): Promise<Price> {
    const price = await this.store.findCurrentPriceByProductId(productId.trim());
    if (!price) {
      throw new Error(`Price not found for product ${productId}.`);
    }
    return price;
  }

  private async requireDiscount(discountId: string): Promise<Discount> {
    const discount = await this.store.findDiscountById(discountId.trim());
    if (!discount) {
      throw new Error(`Discount not found: ${discountId}.`);
    }
    return discount;
  }

  private async requirePromotion(promotionId: string): Promise<Promotion> {
    const promotion = await this.store.findPromotionById(promotionId.trim());
    if (!promotion) {
      throw new Error(`Promotion not found: ${promotionId}.`);
    }
    return promotion;
  }
}

function validateProductId(productId: string): void {
  if (!productId?.trim()) {
    throw new Error("Product id is required.");
  }
}
