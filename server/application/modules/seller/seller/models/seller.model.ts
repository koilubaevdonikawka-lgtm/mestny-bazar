import type { SellerProfile } from "@server/application/modules/seller/seller/models/seller-profile.model";
import {
  SellerStatus,
  type SellerStatusValue,
} from "@server/application/modules/seller/seller/models/seller-status.model";
import type { SellerStore } from "@server/application/modules/seller/seller/models/seller-store.model";

/** Seller aggregate owned by the Seller capability module. */
export interface Seller {
  readonly id: string;
  readonly status: SellerStatusValue;
  readonly profile: SellerProfile;
  readonly store: SellerStore;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createSeller(input: {
  id: string;
  profile: SellerProfile;
  store: SellerStore;
}): Seller {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    status: SellerStatus.Pending,
    profile: input.profile,
    store: input.store,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withSellerStatus(seller: Seller, status: SellerStatusValue): Seller {
  return Object.freeze({
    ...seller,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function withSellerProfile(seller: Seller, profile: SellerProfile): Seller {
  return Object.freeze({
    ...seller,
    profile,
    updatedAt: new Date().toISOString(),
  });
}

export function withSellerStore(seller: Seller, store: SellerStore): Seller {
  return Object.freeze({
    ...seller,
    store,
    updatedAt: new Date().toISOString(),
  });
}
