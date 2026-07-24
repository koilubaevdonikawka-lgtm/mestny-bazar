import type {
  AddressDTO,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@shared/contracts/delivery";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import {
  AddressNotFoundError,
  AddressValidationError,
} from "@server/domain/address.errors";
import { UnauthorizedError } from "@server/domain/orders.errors";

export async function executeListAddresses(): Promise<AddressDTO[]> {
  const userId = await requireUserIdFromRequest();
  return getServices().addressService.listByUser(userId);
}

export async function executeGetAddress(id: string): Promise<AddressDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().addressService.getById(id, userId);
}

export async function executeCreateAddress(data: CreateAddressRequest): Promise<AddressDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().addressService.create(userId, data);
}

export async function executeUpdateAddress(data: UpdateAddressRequest): Promise<AddressDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().addressService.update(userId, data);
}

export async function executeDeleteAddress(id: string): Promise<void> {
  const userId = await requireUserIdFromRequest();
  await getServices().addressService.delete(id, userId);
}

export async function executeSetDefaultAddress(id: string): Promise<AddressDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().addressService.setDefault(id, userId);
}

export function mapAddressError(error: unknown): never {
  if (error instanceof UnauthorizedError) throw error;
  if (error instanceof AddressNotFoundError) throw error;
  if (error instanceof AddressValidationError) throw error;
  throw error;
}
