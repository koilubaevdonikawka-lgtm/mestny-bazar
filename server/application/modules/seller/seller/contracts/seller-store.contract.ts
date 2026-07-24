import type { Seller } from "@server/application/modules/seller/seller/models";

/** Seller persistence contract — implemented by infrastructure adapters. */
export interface ISellerStore {
  saveSeller(seller: Seller): Promise<void>;
  updateSeller(seller: Seller): Promise<void>;
  findSellerById(sellerId: string): Promise<Seller | null>;
}
