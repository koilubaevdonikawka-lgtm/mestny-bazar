/** Input DTO for creating a product review. */
export interface CreateReviewDto {
  readonly productId: string;
  readonly authorId: string;
  readonly rating: number;
  readonly title: string;
  readonly body: string;
}
