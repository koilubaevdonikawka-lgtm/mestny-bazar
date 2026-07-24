export { CustomerModule } from "./api";
export type { ICustomerStore } from "./contracts";
export type {
  CreateCustomerDto,
  UpdateCustomerProfileDto,
  AddCustomerAddressDto,
  UpdateCustomerAddressDto,
} from "./dto";
export {
  type CustomerCreatedEvent,
  type CustomerProfileUpdatedEvent,
  type CustomerAddressAddedEvent,
  type CustomerAddressUpdatedEvent,
  createCustomerCreatedEvent,
  createCustomerProfileUpdatedEvent,
  createCustomerAddressAddedEvent,
  createCustomerAddressUpdatedEvent,
} from "./events";
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
} from "./models";
export { CustomerService } from "./services";
