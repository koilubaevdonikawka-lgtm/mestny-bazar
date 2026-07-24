import type { Review } from "@server/application/modules/reviews/reviews/models";

/** Review persistence contract — implemented by infrastructure adapters. */
export interface IReviewStore {
  createReview(review: Review): Promise<void>;
  updateReview(review: Review): Promise<void>;
  deleteReview(reviewId: string): Promise<void>;
  listByProduct(productId: string): Promise<readonly Review[]>;
  getReview(reviewId: string): Promise<Review | null>;
}
