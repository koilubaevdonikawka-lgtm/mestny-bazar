export interface ApplyPromotionDto {
  readonly productId: string;
  readonly promotionId: string;
  readonly quantity: number;
  readonly currency?: string;
}
