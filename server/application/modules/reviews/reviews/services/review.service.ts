import type { IReviewStore } from "@server/application/modules/reviews/reviews/contracts";
import type { CreateReviewDto, EditReviewDto } from "@server/application/modules/reviews/reviews/dto";
import {
  createReview,
  updateReview,
  type Review,
} from "@server/application/modules/reviews/reviews/models";
import { ReviewPolicy } from "@server/application/modules/reviews/reviews/services/review-policy";
import type { IIdGenerator, IProductRepository } from "@server/application/ports";

/** Reviews business capability service — orchestrates review operations via IReviewStore. */
export class ReviewService {
  private readonly policy = new ReviewPolicy();

  constructor(
    private readonly store: IReviewStore,
    private readonly idGenerator: IIdGenerator,
    private readonly products?: IProductRepository,
  ) {}

  async createReview(input: CreateReviewDto): Promise<Review> {
    const validation = this.policy.validateCreate(input);
    if (!validation.valid) {
      throw new Error(formatIssues(validation.issues));
    }

    const product = await this.products?.findSnapshotById(input.productId);
    if (this.products && !product) {
      throw new Error(`Product not found: ${input.productId}`);
    }

    const duplicate = (await this.store.listByProduct(input.productId)).find(
      (review) => review.authorId === input.authorId,
    );
    if (duplicate) {
      throw new Error("Author has already reviewed this product.");
    }

    const review = createReview({
      id: this.idGenerator.generate(),
      productId: input.productId,
      sellerId: product?.sellerId ?? "unknown-seller",
      authorId: input.authorId,
      rating: input.rating,
      title: input.title,
      body: input.body,
    });

    await this.store.createReview(review);
    return review;
  }

  async editReview(input: EditReviewDto): Promise<Review> {
    const review = await this.requireReview(input.reviewId);
    const validation = this.policy.validateEdit(review, input.authorId, input);
    if (!validation.valid) {
      throw new Error(formatIssues(validation.issues));
    }

    const updated = updateReview(review, input);
    await this.store.updateReview(updated);
    return updated;
  }

  async deleteReview(reviewId: string, authorId: string): Promise<boolean> {
    const review = await this.requireReview(reviewId);
    const validation = this.policy.validateDelete(review, authorId);
    if (!validation.valid) {
      throw new Error(formatIssues(validation.issues));
    }

    await this.store.deleteReview(reviewId);
    return true;
  }

  async listReviews(productId: string): Promise<readonly Review[]> {
    return this.store.listByProduct(productId);
  }

  async getReview(reviewId: string): Promise<Review | null> {
    return this.store.getReview(reviewId);
  }

  private async requireReview(reviewId: string): Promise<Review> {
    const review = await this.store.getReview(reviewId);
    if (!review) {
      throw new Error(`Review not found: ${reviewId}`);
    }
    return review;
  }
}

function formatIssues(issues: readonly { message: string }[]): string {
  return issues.map((issue) => issue.message).join("; ");
}
