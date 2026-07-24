import type {
  AddressDTO,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@shared/contracts/delivery";
import type { IAddressRepository } from "@server/ports/address.repository";
import { AddressNotFoundError, AddressValidationError } from "@server/domain/address.errors";

export class AddressService {
  constructor(private readonly addresses: IAddressRepository) {}

  async listByUser(userId: string): Promise<AddressDTO[]> {
    return this.addresses.listByUser(userId);
  }

  async getById(id: string, userId: string): Promise<AddressDTO> {
    const address = await this.addresses.getById(id, userId);
    if (!address) throw new AddressNotFoundError();
    return address;
  }

  async getDefaultForUser(userId: string): Promise<AddressDTO | null> {
    const list = await this.addresses.listByUser(userId);
    return list.find((a) => a.isDefault) ?? null;
  }

  async create(userId: string, data: CreateAddressRequest): Promise<AddressDTO> {
    this.validateFullAddress(data.fullAddress);
    return this.addresses.create(userId, data);
  }

  async update(userId: string, data: UpdateAddressRequest): Promise<AddressDTO> {
    if (data.fullAddress !== undefined) {
      this.validateFullAddress(data.fullAddress);
    }
    const existing = await this.addresses.getById(data.id, userId);
    if (!existing) throw new AddressNotFoundError();
    return this.addresses.update(userId, data);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.addresses.getById(id, userId);
    if (!existing) throw new AddressNotFoundError();
    await this.addresses.delete(id, userId);
  }

  async setDefault(id: string, userId: string): Promise<AddressDTO> {
    return this.update(userId, { id, isDefault: true });
  }

  private validateFullAddress(fullAddress: string): void {
    if (!fullAddress?.trim() || fullAddress.trim().length < 5) {
      throw new AddressValidationError("Address must be at least 5 characters", "fullAddress");
    }
  }
}
