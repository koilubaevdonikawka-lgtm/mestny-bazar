import type {
  AddressDTO,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@shared/contracts/delivery";
import {
  createAddressFn,
  deleteAddressFn,
  getAddressFn,
  listAddressesFn,
  setDefaultAddressFn,
  updateAddressFn,
} from "@/api/addresses.functions";

export async function listAddresses(): Promise<AddressDTO[]> {
  return listAddressesFn();
}

export async function getAddress(id: string): Promise<AddressDTO> {
  return getAddressFn({ data: { id } });
}

export async function createAddress(data: CreateAddressRequest): Promise<AddressDTO> {
  return createAddressFn({ data });
}

export async function updateAddress(data: UpdateAddressRequest): Promise<AddressDTO> {
  return updateAddressFn({ data });
}

export async function deleteAddress(id: string): Promise<void> {
  await deleteAddressFn({ data: { id } });
}

export async function setDefaultAddress(id: string): Promise<AddressDTO> {
  return setDefaultAddressFn({ data: { id } });
}
