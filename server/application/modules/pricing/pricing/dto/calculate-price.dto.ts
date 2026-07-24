export interface CalculatePriceDto {
  readonly productId: string;
  readonly quantity: number;
  readonly currency?: string;
  readonly discountId?: string | null;
  readonly promotionId?: string | null;
}
