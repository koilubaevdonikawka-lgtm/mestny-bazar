import { ApiValidationError } from "@server/api/errors/api.errors";
import type { ReviewsModule } from "@server/application/modules/reviews";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readRecordBody,
  readString,
  resolveAuthorId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Review HTTP controller — delegates to ReviewsModule. */
export class ReviewController {
  constructor(private readonly reviews: ReviewsModule) {}

  async listByProduct(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = context.params.productId;
    if (!productId?.trim()) {
      throw new ApiValidationError({ productId: ["productId is required"] });
    }

    const items = await this.reviews.listReviews(productId);
    return createJsonResponse(context, items);
  }

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const productId = context.params.productId;
    const authorId = resolveAuthorId(context, body);
    const rating = readNumber(body.rating);
    const title = readString(body.title);
    const reviewBody = readString(body.body);

    if (!productId?.trim()) {
      throw new ApiValidationError({ productId: ["productId is required"] });
    }
    if (rating === undefined) {
      throw new ApiValidationError({ rating: ["rating is required"] });
    }
    if (!title) {
      throw new ApiValidationError({ title: ["title is required"] });
    }
    if (!reviewBody) {
      throw new ApiValidationError({ body: ["body is required"] });
    }

    const review = await this.reviews.createReview({
      productId,
      authorId,
      rating,
      title,
      body: reviewBody,
    });

    return createJsonResponse(context, review, 201);
  }

  async edit(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const reviewId = context.params.reviewId;
    const authorId = resolveAuthorId(context, body);

    if (!reviewId?.trim()) {
      throw new ApiValidationError({ reviewId: ["reviewId is required"] });
    }

    const review = await this.reviews.editReview({
      reviewId,
      authorId,
      rating: readNumber(body.rating),
      title: readString(body.title),
      body: readString(body.body),
    });

    return createJsonResponse(context, review);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const reviewId = context.params.reviewId;
    const authorId = resolveAuthorId(context, body);

    if (!reviewId?.trim()) {
      throw new ApiValidationError({ reviewId: ["reviewId is required"] });
    }

    const deleted = await this.reviews.deleteReview(reviewId, authorId);
    return createJsonResponse(context, { reviewId, deleted });
  }
}
