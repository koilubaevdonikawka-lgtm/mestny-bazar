import type { SellerReadModel, ReconstituteSellerProps } from "@server/domain/seller";
import { Seller } from "@server/domain/seller";

export function sellerReadModelToReconstituteProps(
  model: SellerReadModel,
): ReconstituteSellerProps {
  return {
    id: model.id,
    name: model.name,
    phone: model.phone,
    email: model.email,
    address: model.address,
    status: model.status,
    verification: {
      level: model.verificationLevel,
      submittedAt: model.verificationSubmittedAt,
      verifiedAt: model.verificationVerifiedAt,
      rejectionReason: model.verificationRejectionReason,
    },
    rating: {
      score: model.ratingScore,
      reviewCount: model.ratingReviewCount,
    },
    limits: {
      maxProducts: model.limits.maxProducts,
      maxPublishedProducts: model.limits.maxPublishedProducts,
      maxImagesPerProduct: model.limits.maxImagesPerProduct,
      maxCategories: model.limits.maxCategories,
      extensions: { ...model.limits.extensions },
    },
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export function reconstituteSeller(model: SellerReadModel): Seller {
  return Seller.reconstitute(sellerReadModelToReconstituteProps(model));
}
