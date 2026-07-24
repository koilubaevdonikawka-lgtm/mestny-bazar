/** Input DTO for adding a product to customer favorites. */
export interface AddFavoriteDto {
  readonly userId: string;
  readonly productId: string;
}
