import type { CreateStoreRequest, StoreDTO, UpdateStoreRequest } from "@shared/contracts/delivery";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeListAdminStores(): Promise<StoreDTO[]> {
  await requireAdminFromRequest();
  return getServices().storeService.listStores();
}

export async function executeCreateStore(data: CreateStoreRequest): Promise<StoreDTO> {
  await requireAdminFromRequest();
  return getServices().storeService.createStore(data);
}

export async function executeUpdateStore(data: UpdateStoreRequest): Promise<StoreDTO> {
  await requireAdminFromRequest();
  return getServices().storeService.updateStore(data);
}
