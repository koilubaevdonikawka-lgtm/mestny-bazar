import type { ISellerProfileRepository } from "@server/ports/seller-profile.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type {
  SellerProfileDTO,
  UpsertSellerProfileRequest,
} from "@shared/contracts/seller-profile";
import { SellerVerificationStatus } from "@shared/contracts/seller-profile";
import {
  SellerProfileNotFoundError,
  SellerProfileValidationError,
} from "@server/domain/seller-profile.errors";

/**
 * Seller as a business entity (sellers.md) — distinct from the "seller" role (product
 * access only) and from ProfileDTO (general user profile). Verification is a simple
 * explicit two-action transition, not a full Rule Engine, per sellers.md's own guidance
 * ("на старте может быть простым явным переходом... не потребовалось переписывание при
 * усложнении") — the service boundary is what stays stable if it grows into one later.
 */
export class SellerProfileService {
  constructor(
    private readonly profiles: ISellerProfileRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listSellers(): Promise<SellerProfileDTO[]> {
    return this.profiles.listAll();
  }

  async getProfile(userId: string): Promise<SellerProfileDTO> {
    const profile = await this.profiles.getByUserId(userId);
    if (!profile) throw new SellerProfileNotFoundError();
    return profile;
  }

  async upsertOwnProfile(
    userId: string,
    data: UpsertSellerProfileRequest,
  ): Promise<SellerProfileDTO> {
    this.validateStoreName(data.storeName);

    const existing = await this.profiles.getByUserId(userId);
    const profile = await this.profiles.upsert(userId, data);

    if (!existing) {
      await this.events.publish({ type: "seller.registered", userId });
    }

    return profile;
  }

  async verifySeller(userId: string): Promise<SellerProfileDTO> {
    const profile = await this.profiles.setVerificationStatus(
      userId,
      SellerVerificationStatus.VERIFIED,
    );
    await this.events.publish({ type: "seller.verified", userId });
    return profile;
  }

  async rejectSeller(userId: string): Promise<SellerProfileDTO> {
    const profile = await this.profiles.setVerificationStatus(
      userId,
      SellerVerificationStatus.REJECTED,
    );
    await this.events.publish({ type: "seller.rejected", userId });
    return profile;
  }

  private validateStoreName(storeName: string): void {
    if (!storeName?.trim() || storeName.trim().length < 2) {
      throw new SellerProfileValidationError(
        "Store name must be at least 2 characters",
        "storeName",
      );
    }
  }
}
