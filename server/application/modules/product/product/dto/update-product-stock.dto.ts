export interface UpdateProductStockDto {
  readonly productId: string;
  readonly sellerId: string;
  readonly quantity: number;
}
