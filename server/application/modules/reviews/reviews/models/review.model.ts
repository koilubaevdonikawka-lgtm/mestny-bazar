/** Product review authored by a marketplace customer. */
export interface Review {
  readonly id: string;
  readonly productId: string;
  readonly sellerId: string;
  readonly authorId: string;
  readonly rating: number;
  readonly title: string;
  readonly body: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createReview(input: {
  id: string;
  productId: string;
  sellerId: string;
  authorId: string;
  rating: number;
  title: string;
  body: string;
}): Review {
  const timestamp = new Date().toISOString();
  return Object.freeze({
    id: input.id,
    productId: input.productId,
    sellerId: input.sellerId,
    authorId: input.authorId,
    rating: input.rating,
    title: input.title.trim(),
    body: input.body.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function updateReview(
  review: Review,
  input: { rating?: number; title?: string; body?: string },
): Review {
  return Object.freeze({
    ...review,
    rating: input.rating ?? review.rating,
    title: input.title?.trim() ?? review.title,
    body: input.body?.trim() ?? review.body,
    updatedAt: new Date().toISOString(),
  });
}
