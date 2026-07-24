import type { ICustomerStore } from "@server/application/modules/customer/customer/contracts";
import type {
  Customer,
  CustomerAddress,
} from "@server/application/modules/customer/customer/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory customer store for development and tests. */
export class MemoryCustomerStore implements ICustomerStore {
  private readonly customers = new InMemoryStore<Customer>((customer) => customer.id);
  private readonly addresses = new InMemoryStore<CustomerAddress>((address) => address.id);
  private readonly addressesByCustomer = new Map<string, Set<string>>();

  async saveCustomer(customer: Customer): Promise<void> {
    this.customers.set(customer);
  }

  async updateCustomer(customer: Customer): Promise<void> {
    if (!this.customers.has(customer.id)) {
      throw new Error(`Customer not found: ${customer.id}`);
    }
    this.customers.set(customer);
  }

  async findCustomerById(customerId: string): Promise<Customer | null> {
    return this.customers.get(customerId) ?? null;
  }

  async saveAddress(address: CustomerAddress): Promise<void> {
    this.addresses.set(address);
    const bucket = this.addressesByCustomer.get(address.customerId) ?? new Set<string>();
    bucket.add(address.id);
    this.addressesByCustomer.set(address.customerId, bucket);
  }

  async updateAddress(address: CustomerAddress): Promise<void> {
    if (!this.addresses.has(address.id)) {
      throw new Error(`Customer address not found: ${address.id}`);
    }
    this.addresses.set(address);
  }

  async findAddressById(addressId: string): Promise<CustomerAddress | null> {
    return this.addresses.get(addressId) ?? null;
  }

  async findAddressesByCustomerId(customerId: string): Promise<readonly CustomerAddress[]> {
    const ids = this.addressesByCustomer.get(customerId);
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((addressId) => this.addresses.get(addressId))
        .filter((address): address is CustomerAddress => address !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async findDefaultAddress(customerId: string): Promise<CustomerAddress | null> {
    const addresses = await this.findAddressesByCustomerId(customerId);
    return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  }

  async deleteAddress(addressId: string): Promise<void> {
    const address = this.addresses.get(addressId);
    if (!address) {
      return;
    }

    this.addresses.delete(addressId);
    const bucket = this.addressesByCustomer.get(address.customerId);
    bucket?.delete(addressId);
  }
}
