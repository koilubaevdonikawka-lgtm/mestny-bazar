import type { ModerationModule } from "@server/application/modules/moderation/moderation/api/moderation.module";
import {
  ModerationStatus,
  ModerationTarget,
} from "@server/application/modules/moderation/moderation/models";
import type { ISellerStore } from "@server/application/modules/seller/seller/contracts";
import type {
  ApproveSellerDto,
  CreateSellerDto,
  SuspendSellerDto,
  UpdateSellerProfileDto,
} from "@server/application/modules/seller/seller/dto";
import {
  createSellerCreatedEvent,
  createSellerProfileUpdatedEvent,
  createSellerSuspendedEvent,
} from "@server/application/modules/seller/seller/events";
import {
  createSeller,
  createSellerProfile,
  createSellerStore,
  SellerStatus,
  updateSellerProfile,
  updateSellerStore,
  withSellerProfile,
  withSellerStatus,
  withSellerStore,
  type Seller,
} from "@server/application/modules/seller/seller/models";
import type { IIdGenerator } from "@server/application/ports";

/** Seller business capability service — orchestrates sellers via ISellerStore. */
export class SellerService {
  constructor(
    private readonly store: ISellerStore,
    private readonly idGenerator: IIdGenerator,
    private readonly moderation: ModerationModule,
  ) {}

  async createSeller(dto: CreateSellerDto): Promise<Seller> {
    validateCreateSellerDto(dto);

    const sellerId = this.idGenerator.generate();
    const storeId = this.idGenerator.generate();
    const profile = createSellerProfile({
      displayName: dto.displayName,
      email: dto.email,
      phone: dto.phone,
      description: dto.description,
    });
    const store = createSellerStore({
      id: storeId,
      sellerId,
      name: dto.storeName,
      address: dto.storeAddress,
    });
    const seller = createSeller({ id: sellerId, profile, store });

    await this.store.saveSeller(seller);
    createSellerCreatedEvent(seller);

    await this.moderation.requestModeration({
      target: ModerationTarget.Seller,
      targetId: seller.id,
      requestedBy: seller.id,
    });

    return seller;
  }

  async getSeller(sellerId: string): Promise<Seller | null> {
    return this.store.findSellerById(sellerId.trim());
  }

  async updateProfile(dto: UpdateSellerProfileDto): Promise<Seller> {
    validateUpdateSellerProfileDto(dto);

    const seller = await this.requireSeller(dto.sellerId);
    const nextProfile = updateSellerProfile(seller.profile, {
      displayName: dto.displayName,
      email: dto.email,
      phone: dto.phone,
      description: dto.description,
    });
    const nextStore = updateSellerStore(seller.store, {
      name: dto.storeName,
      address: dto.storeAddress,
    });

    const updated = withSellerStore(withSellerProfile(seller, nextProfile), nextStore);
    await this.store.updateSeller(updated);
    createSellerProfileUpdatedEvent(updated);

    return updated;
  }

  async approveSeller(dto: ApproveSellerDto): Promise<Seller> {
    const seller = await this.requireSeller(dto.sellerId);
    const moderationStatus = await this.moderation.getStatus({
      target: ModerationTarget.Seller,
      targetId: seller.id,
    });

    if (moderationStatus !== ModerationStatus.Approved) {
      throw new Error(`Seller ${seller.id} is not approved by moderation.`);
    }

    if (seller.status === SellerStatus.Approved) {
      return seller;
    }

    const approved = withSellerStatus(seller, SellerStatus.Approved);
    await this.store.updateSeller(approved);

    return approved;
  }

  async suspendSeller(dto: SuspendSellerDto): Promise<Seller> {
    const seller = await this.requireSeller(dto.sellerId);
    if (seller.status === SellerStatus.Suspended) {
      return seller;
    }

    const suspended = withSellerStatus(seller, SellerStatus.Suspended);
    await this.store.updateSeller(suspended);
    createSellerSuspendedEvent(suspended, dto.reason?.trim() || null);

    return suspended;
  }

  async isSellerApproved(sellerId: string): Promise<boolean> {
    const seller = await this.store.findSellerById(sellerId.trim());
    if (!seller || seller.status === SellerStatus.Suspended) {
      return false;
    }

    const moderationStatus = await this.moderation.getStatus({
      target: ModerationTarget.Seller,
      targetId: sellerId.trim(),
    });

    return moderationStatus === ModerationStatus.Approved;
  }

  private async requireSeller(sellerId: string): Promise<Seller> {
    const seller = await this.store.findSellerById(sellerId.trim());
    if (!seller) {
      throw new Error(`Seller not found: ${sellerId}`);
    }
    return seller;
  }
}

function validateCreateSellerDto(dto: CreateSellerDto): void {
  if (!dto.displayName?.trim()) {
    throw new Error("Seller display name is required.");
  }
  if (!dto.email?.trim()) {
    throw new Error("Seller email is required.");
  }
  if (!dto.phone?.trim()) {
    throw new Error("Seller phone is required.");
  }
  if (!dto.storeName?.trim()) {
    throw new Error("Seller store name is required.");
  }
}

function validateUpdateSellerProfileDto(dto: UpdateSellerProfileDto): void {
  if (!dto.sellerId?.trim()) {
    throw new Error("Seller id is required.");
  }
  validateCreateSellerDto(dto);
}
