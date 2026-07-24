export { CustomerModule } from "./customer";
export type { ICustomerStore } from "./customer/contracts";
export type {
  CreateCustomerDto,
  UpdateCustomerProfileDto,
  AddCustomerAddressDto,
  UpdateCustomerAddressDto,
} from "./customer/dto";
export {
  type CustomerCreatedEvent,
  type CustomerProfileUpdatedEvent,
  type CustomerAddressAddedEvent,
  type CustomerAddressUpdatedEvent,
  createCustomerCreatedEvent,
  createCustomerProfileUpdatedEvent,
  createCustomerAddressAddedEvent,
  createCustomerAddressUpdatedEvent,
} from "./customer/events";
export {
  type Customer,
  type CustomerProfile,
  type CustomerAddress,
  type CustomerContact,
  createCustomer,
  createCustomerProfile,
  createCustomerAddress,
  createCustomerContact,
  updateCustomerProfile,
  updateCustomerAddress,
  withCustomerProfile,
  withCustomerAddressDefault,
  withCustomerContactPhone,
  withCustomerContactEmail,
} from "./customer/models";
export { CustomerService } from "./customer/services";
