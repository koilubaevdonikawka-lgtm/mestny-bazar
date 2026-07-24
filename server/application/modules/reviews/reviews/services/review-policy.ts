import type { Review } from "@server/application/modules/reviews/reviews/models";

export interface ReviewValidationIssue {
  readonly field: string;
  readonly message: string;
}

export interface ReviewValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ReviewValidationIssue[];
}

/** Application review policy — validates review content and ownership rules. */
export class ReviewPolicy {
  validateCreate(input: {
    rating: number;
    title: string;
    body: string;
  }): ReviewValidationResult {
    return this.validateContent(input.rating, input.title, input.body);
  }

  validateEdit(
    review: Review,
    authorId: string,
    input: { rating?: number; title?: string; body?: string },
  ): ReviewValidationResult {
    if (review.authorId !== authorId) {
      return Object.freeze({
        valid: false,
        issues: Object.freeze([{ field: "authorId", message: "Only the author can edit this review." }]),
      });
    }

    return this.validateContent(
      input.rating ?? review.rating,
      input.title ?? review.title,
      input.body ?? review.body,
    );
  }

  validateDelete(review: Review, authorId: string): ReviewValidationResult {
    if (review.authorId !== authorId) {
      return Object.freeze({
        valid: false,
        issues: Object.freeze([{ field: "authorId", message: "Only the author can delete this review." }]),
      });
    }

    return Object.freeze({ valid: true, issues: Object.freeze([]) });
  }

  private validateContent(rating: number, title: string, body: string): ReviewValidationResult {
    const issues: ReviewValidationIssue[] = [];

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      issues.push({ field: "rating", message: "Rating must be an integer between 1 and 5." });
    }

    if (!title.trim()) {
      issues.push({ field: "title", message: "Review title is required." });
    }

    if (!body.trim()) {
      issues.push({ field: "body", message: "Review body is required." });
    }

    if (body.trim().length > 2000) {
      issues.push({ field: "body", message: "Review body must not exceed 2000 characters." });
    }

    return Object.freeze({
      valid: issues.length === 0,
      issues: Object.freeze([...issues]),
    });
  }
}
