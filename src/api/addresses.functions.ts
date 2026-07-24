import { createServerFn } from "@tanstack/react-start";
import type {
  AddressDTO,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@shared/contracts/delivery";

async function runAddress<T>(fn: () => Promise<T>): Promise<T> {
  const { mapAddressError } = await import("@server/functions/addresses.executor");
  try {
    return await fn();
  } catch (e) {
    mapAddressError(e);
  }
}

export const listAddressesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AddressDTO[]> => {
    const { executeListAddresses } = await import("@server/functions/addresses.executor");
    return runAddress(() => executeListAddresses());
  },
);

export const getAddressFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<AddressDTO> => {
    const { executeGetAddress } = await import("@server/functions/addresses.executor");
    return runAddress(() => executeGetAddress(data.id));
  });

export const createAddressFn = createServerFn({ method: "POST" })
  .validator((data: CreateAddressRequest) => data)
  .handler(async ({ data }): Promise<AddressDTO> => {
    const { executeCreateAddress } = await import("@server/functions/addresses.executor");
    return runAddress(() => executeCreateAddress(data));
  });

export const updateAddressFn = createServerFn({ method: "POST" })
  .validator((data: UpdateAddressRequest) => data)
  .handler(async ({ data }): Promise<AddressDTO> => {
    const { executeUpdateAddress } = await import("@server/functions/addresses.executor");
    return runAddress(() => executeUpdateAddress(data));
  });

export const deleteAddressFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { executeDeleteAddress } = await import("@server/functions/addresses.executor");
    await runAddress(() => executeDeleteAddress(data.id));
    return { ok: true };
  });

export const setDefaultAddressFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<AddressDTO> => {
    const { executeSetDefaultAddress } = await import("@server/functions/addresses.executor");
    return runAddress(() => executeSetDefaultAddress(data.id));
  });
