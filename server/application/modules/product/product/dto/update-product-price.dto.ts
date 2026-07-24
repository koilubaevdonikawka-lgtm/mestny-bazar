export interface UpdateProductPriceDto {
  readonly productId: string;
  readonly sellerId: string;
  readonly amount: number;
  readonly currency: string;
}
