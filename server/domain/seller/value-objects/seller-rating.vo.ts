import { InvalidSellerRatingError } from "@server/domain/seller/exceptions/seller.errors";
import type { ValueObject } from "@server/domain/seller/value-objects/value-object.types";

export interface SellerRatingJSON {
  score: number;
  reviewCount: number;
}

export class SellerRating implements ValueObject<SellerRating, SellerRatingJSON> {
  private constructor(
    private readonly score: number,
    private readonly reviewCount: number,
  ) {}

  static create(score: number, reviewCount: number): SellerRating {
    if (
      !Number.isFinite(score) ||
      score < 0 ||
      score > 5 ||
      !Number.isInteger(reviewCount) ||
      reviewCount < 0
    ) {
      throw new InvalidSellerRatingError();
    }
    return new SellerRating(Number(score.toFixed(2)), reviewCount);
  }

  static initial(): SellerRating {
    return new SellerRating(0, 0);
  }

  static from(json: SellerRatingJSON): SellerRating {
    return SellerRating.create(json.score, json.reviewCount);
  }

  valueOf(): SellerRatingJSON {
    return this.toJSON();
  }

  scoreValue(): number {
    return this.score;
  }

  reviewCountValue(): number {
    return this.reviewCount;
  }

  equals(other: SellerRating): boolean {
    return this.score === other.score && this.reviewCount === other.reviewCount;
  }

  toJSON(): SellerRatingJSON {
    return Object.freeze({ score: this.score, reviewCount: this.reviewCount });
  }

  clone(): SellerRating {
    return SellerRating.from(this.toJSON());
  }
}
