import type {
  AddressDTO,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@shared/contracts/delivery";

export interface IAddressRepository {
  listByUser(userId: string): Promise<AddressDTO[]>;
  getById(id: string, userId: string): Promise<AddressDTO | null>;
  create(userId: string, data: CreateAddressRequest): Promise<AddressDTO>;
  update(userId: string, data: UpdateAddressRequest): Promise<AddressDTO>;
  delete(id: string, userId: string): Promise<void>;
}
