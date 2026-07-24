/** Input DTO for editing an existing product review. */
export interface EditReviewDto {
  readonly reviewId: string;
  readonly authorId: string;
  readonly rating?: number;
  readonly title?: string;
  readonly body?: string;
}
