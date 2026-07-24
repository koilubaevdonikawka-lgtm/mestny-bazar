export { ReviewsModule } from "./reviews";
export type { IReviewStore } from "./reviews/contracts";
export type { CreateReviewDto, EditReviewDto } from "./reviews/dto";
export { type Review, createReview, updateReview } from "./reviews/models";
export {
  ReviewService,
  ReviewPolicy,
  type ReviewValidationIssue,
  type ReviewValidationResult,
} from "./reviews/services";

/** @deprecated Use CreateReviewDto */
export type { CreateReviewDto as CreateReviewInput } from "./reviews/dto";
/** @deprecated Use EditReviewDto */
export type { EditReviewDto as EditReviewInput } from "./reviews/dto";
