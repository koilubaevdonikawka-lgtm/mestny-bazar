import type { Seller } from "@server/domain/seller";
import type { SellerReadModel } from "@server/domain/seller";

/** Seller persistence port — implementation lives in adapters. */
export interface ISellerRepository {
  save(seller: Seller): Promise<void>;
  findById(id: string): Promise<Seller | null>;
  findSnapshotById(id: string): Promise<SellerReadModel | null>;
  exists(id: string): Promise<boolean>;
}
