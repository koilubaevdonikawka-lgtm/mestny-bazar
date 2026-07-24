import type { IReviewStore } from "@server/application/modules/reviews/reviews/contracts";
import type { Review } from "@server/application/modules/reviews/reviews/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory review store for development and tests. */
export class MemoryReviewStore implements IReviewStore {
  private readonly reviews = new InMemoryStore<Review>((review) => review.id);
  private readonly byProduct = new Map<string, Set<string>>();

  async createReview(review: Review): Promise<void> {
    this.reviews.set(review);
    const bucket = this.byProduct.get(review.productId) ?? new Set<string>();
    bucket.add(review.id);
    this.byProduct.set(review.productId, bucket);
  }

  async updateReview(review: Review): Promise<void> {
    if (!this.reviews.has(review.id)) {
      throw new Error(`Review not found: ${review.id}`);
    }
    this.reviews.set(review);
  }

  async deleteReview(reviewId: string): Promise<void> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      return;
    }
    this.reviews.delete(reviewId);
    this.byProduct.get(review.productId)?.delete(reviewId);
  }

  async listByProduct(productId: string): Promise<readonly Review[]> {
    const ids = this.byProduct.get(productId);
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((reviewId) => this.reviews.get(reviewId))
        .filter((review): review is Review => review !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async getReview(reviewId: string): Promise<Review | null> {
    return this.reviews.get(reviewId) ?? null;
  }
}
