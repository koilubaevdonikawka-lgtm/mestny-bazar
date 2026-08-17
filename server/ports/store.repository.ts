import type { CreateStoreRequest, StoreDTO, UpdateStoreRequest } from "@shared/contracts/delivery";

/** Admin-facing — Store has no buyer-facing read path today (delivery-zones.md: not yet referenced by any zone). */
export interface IStoreRepository {
  listAll(): Promise<StoreDTO[]>;
  getById(id: string): Promise<StoreDTO | null>;
  create(data: CreateStoreRequest): Promise<StoreDTO>;
  update(data: UpdateStoreRequest): Promise<StoreDTO>;
}
