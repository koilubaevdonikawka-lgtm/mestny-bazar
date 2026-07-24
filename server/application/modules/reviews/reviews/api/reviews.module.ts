import type { CreateReviewDto, EditReviewDto } from "@server/application/modules/reviews/reviews/dto";
import type { Review } from "@server/application/modules/reviews/reviews/models";
import type { ReviewService } from "@server/application/modules/reviews/reviews/services";

/** Public entry point for the Reviews business capability module. */
export class ReviewsModule {
  constructor(private readonly service: ReviewService) {}

  listReviews(productId: string): Promise<readonly Review[]> {
    return this.service.listReviews(productId);
  }

  createReview(input: CreateReviewDto): Promise<Review> {
    return this.service.createReview(input);
  }

  editReview(input: EditReviewDto): Promise<Review> {
    return this.service.editReview(input);
  }

  deleteReview(reviewId: string, authorId: string): Promise<boolean> {
    return this.service.deleteReview(reviewId, authorId);
  }

  getReview(reviewId: string): Promise<Review | null> {
    return this.service.getReview(reviewId);
  }
}
