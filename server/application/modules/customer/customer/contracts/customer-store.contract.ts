import type {
  Customer,
  CustomerAddress,
} from "@server/application/modules/customer/customer/models";

/** Customer persistence contract — implemented by infrastructure adapters. */
export interface ICustomerStore {
  saveCustomer(customer: Customer): Promise<void>;
  updateCustomer(customer: Customer): Promise<void>;
  findCustomerById(customerId: string): Promise<Customer | null>;

  saveAddress(address: CustomerAddress): Promise<void>;
  updateAddress(address: CustomerAddress): Promise<void>;
  findAddressById(addressId: string): Promise<CustomerAddress | null>;
  findAddressesByCustomerId(customerId: string): Promise<readonly CustomerAddress[]>;
  findDefaultAddress(customerId: string): Promise<CustomerAddress | null>;
  deleteAddress(addressId: string): Promise<void>;
}
