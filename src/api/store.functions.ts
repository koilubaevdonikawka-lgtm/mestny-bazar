import { createServerFn } from "@tanstack/react-start";
import type { StoreDTO } from "@shared/contracts/delivery";
import {
  createStoreRequestSchema,
  updateStoreRequestSchema,
} from "@shared/validation/delivery.schema";

export const listAdminStoresFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<StoreDTO[]> => {
    const { executeListAdminStores } = await import("@server/functions/store.executor");
    return executeListAdminStores();
  },
);

export const createStoreFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createStoreRequestSchema.parse(data))
  .handler(async ({ data }): Promise<StoreDTO> => {
    const { executeCreateStore } = await import("@server/functions/store.executor");
    return executeCreateStore(data);
  });

export const updateStoreFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateStoreRequestSchema.parse(data))
  .handler(async ({ data }): Promise<StoreDTO> => {
    const { executeUpdateStore } = await import("@server/functions/store.executor");
    return executeUpdateStore(data);
  });
