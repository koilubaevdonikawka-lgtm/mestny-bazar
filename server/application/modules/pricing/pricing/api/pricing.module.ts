import type {
  ApplyDiscountDto,
  ApplyPromotionDto,
  CalculatePriceDto,
  CreateDiscountDto,
  CreatePriceDto,
  CreatePromotionDto,
  UpdatePriceDto,
} from "@server/application/modules/pricing/pricing/dto";
import type {
  Discount,
  Price,
  PriceAmount,
  PriceCalculation,
  Promotion,
} from "@server/application/modules/pricing/pricing/models";
import type { PricingService } from "@server/application/modules/pricing/pricing/services";

/** Public entry point for the Pricing business capability module. */
export class PricingModule {
  constructor(private readonly service: PricingService) {}

  createPrice(dto: CreatePriceDto): Promise<Price> {
    return this.service.createPrice(dto);
  }

  updatePrice(dto: UpdatePriceDto): Promise<Price> {
    return this.service.updatePrice(dto);
  }

  getCurrentPrice(productId: string): Promise<PriceAmount | null> {
    return this.service.getCurrentPrice(productId);
  }

  calculatePrice(dto: CalculatePriceDto): Promise<PriceCalculation> {
    return this.service.calculatePrice(dto);
  }

  applyDiscount(dto: ApplyDiscountDto): Promise<PriceCalculation> {
    return this.service.applyDiscount(dto);
  }

  applyPromotion(dto: ApplyPromotionDto): Promise<PriceCalculation> {
    return this.service.applyPromotion(dto);
  }

  createDiscount(dto: CreateDiscountDto): Promise<Discount> {
    return this.service.createDiscount(dto);
  }

  createPromotion(dto: CreatePromotionDto): Promise<Promotion> {
    return this.service.createPromotion(dto);
  }
}
