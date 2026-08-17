import { createServerFn } from "@tanstack/react-start";
import type { SupplierDTO, SupplyDTO } from "@shared/contracts/supplier";
import {
  createSupplierRequestSchema,
  createSupplyRequestSchema,
  supplyIdParamSchema,
  updateSupplierRequestSchema,
} from "@shared/validation/supplier.schema";

export const listSuppliersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SupplierDTO[]> => {
    const { executeListSuppliers } = await import("@server/functions/supplier.executor");
    return executeListSuppliers();
  },
);

export const createSupplierFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createSupplierRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SupplierDTO> => {
    const { executeCreateSupplier } = await import("@server/functions/supplier.executor");
    return executeCreateSupplier(data);
  });

export const updateSupplierFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateSupplierRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SupplierDTO> => {
    const { executeUpdateSupplier } = await import("@server/functions/supplier.executor");
    return executeUpdateSupplier(data);
  });

export const listSuppliesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SupplyDTO[]> => {
    const { executeListSupplies } = await import("@server/functions/supplier.executor");
    return executeListSupplies();
  },
);

export const createSupplyFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createSupplyRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SupplyDTO> => {
    const { executeCreateSupply } = await import("@server/functions/supplier.executor");
    return executeCreateSupply(data);
  });

export const sendSupplyFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => supplyIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<SupplyDTO> => {
    const { executeSendSupply } = await import("@server/functions/supplier.executor");
    return executeSendSupply(data.id);
  });

export const confirmSupplyFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => supplyIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<SupplyDTO> => {
    const { executeConfirmSupply } = await import("@server/functions/supplier.executor");
    return executeConfirmSupply(data.id);
  });

export const receiveSupplyFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => supplyIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<SupplyDTO> => {
    const { executeReceiveSupply } = await import("@server/functions/supplier.executor");
    return executeReceiveSupply(data.id);
  });

export const cancelSupplyFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => supplyIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<SupplyDTO> => {
    const { executeCancelSupply } = await import("@server/functions/supplier.executor");
    return executeCancelSupply(data.id);
  });
