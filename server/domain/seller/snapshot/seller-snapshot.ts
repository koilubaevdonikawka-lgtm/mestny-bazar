import type { SellerLifecycleStatus } from "@server/domain/seller/status/seller-status";
import {
  SellerAddress,
  SellerEmail,
  SellerId,
  SellerLimits,
  SellerName,
  SellerPhone,
  SellerRating,
  SellerStatus,
  SellerVerification,
} from "@server/domain/seller/value-objects";
import type { SellerVerificationLevel } from "@server/domain/seller/value-objects/seller-verification.vo";

export interface SellerReadModel {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: SellerLifecycleStatus;
  verificationLevel: SellerVerificationLevel;
  verificationSubmittedAt: string | null;
  verificationVerifiedAt: string | null;
  verificationRejectionReason: string | null;
  ratingScore: number;
  ratingReviewCount: number;
  limits: {
    maxProducts: number;
    maxPublishedProducts: number;
    maxImagesPerProduct: number;
    maxCategories: number;
    extensions: Record<string, number>;
  };
  createdAt: string;
  updatedAt: string;
}

export class SellerSnapshot implements SellerReadModel {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly status: SellerLifecycleStatus;
  readonly verificationLevel: SellerVerificationLevel;
  readonly verificationSubmittedAt: string | null;
  readonly verificationVerifiedAt: string | null;
  readonly verificationRejectionReason: string | null;
  readonly ratingScore: number;
  readonly ratingReviewCount: number;
  readonly limits: SellerReadModel["limits"];
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(data: SellerReadModel) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.address = data.address;
    this.status = data.status;
    this.verificationLevel = data.verificationLevel;
    this.verificationSubmittedAt = data.verificationSubmittedAt;
    this.verificationVerifiedAt = data.verificationVerifiedAt;
    this.verificationRejectionReason = data.verificationRejectionReason;
    this.ratingScore = data.ratingScore;
    this.ratingReviewCount = data.ratingReviewCount;
    this.limits = Object.freeze({
      ...data.limits,
      extensions: Object.freeze({ ...data.limits.extensions }),
    });
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    Object.freeze(this);
  }

  static capture(input: {
    id: SellerId;
    name: SellerName;
    phone: SellerPhone;
    email: SellerEmail;
    address: SellerAddress;
    status: SellerStatus;
    verification: SellerVerification;
    rating: SellerRating;
    limits: SellerLimits;
    createdAt: string;
    updatedAt: string;
  }): SellerSnapshot {
    const verification = input.verification.toJSON();
    const limits = input.limits.toJSON();

    return new SellerSnapshot({
      id: input.id.toString(),
      name: input.name.toString(),
      phone: input.phone.toString(),
      email: input.email.toString(),
      address: input.address.toString(),
      status: input.status.toString(),
      verificationLevel: verification.level,
      verificationSubmittedAt: verification.submittedAt,
      verificationVerifiedAt: verification.verifiedAt,
      verificationRejectionReason: verification.rejectionReason,
      ratingScore: input.rating.scoreValue(),
      ratingReviewCount: input.rating.reviewCountValue(),
      limits: {
        maxProducts: limits.maxProducts,
        maxPublishedProducts: limits.maxPublishedProducts,
        maxImagesPerProduct: limits.maxImagesPerProduct,
        maxCategories: limits.maxCategories,
        extensions: { ...limits.extensions },
      },
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  static fromJSON(data: SellerReadModel): SellerSnapshot {
    return new SellerSnapshot(data);
  }

  toJSON(): SellerReadModel {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      address: this.address,
      status: this.status,
      verificationLevel: this.verificationLevel,
      verificationSubmittedAt: this.verificationSubmittedAt,
      verificationVerifiedAt: this.verificationVerifiedAt,
      verificationRejectionReason: this.verificationRejectionReason,
      ratingScore: this.ratingScore,
      ratingReviewCount: this.ratingReviewCount,
      limits: {
        ...this.limits,
        extensions: { ...this.limits.extensions },
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  equals(other: SellerSnapshot): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  clone(): SellerSnapshot {
    return SellerSnapshot.fromJSON(this.toJSON());
  }
}
