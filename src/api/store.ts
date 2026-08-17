import type { CreateStoreRequest, StoreDTO, UpdateStoreRequest } from "@shared/contracts/delivery";
import { createStoreFn, listAdminStoresFn, updateStoreFn } from "@/api/store.functions";

export async function listAdminStores(): Promise<StoreDTO[]> {
  return listAdminStoresFn();
}

export async function createStore(request: CreateStoreRequest): Promise<StoreDTO> {
  return createStoreFn({ data: request });
}

export async function updateStore(request: UpdateStoreRequest): Promise<StoreDTO> {
  return updateStoreFn({ data: request });
}
