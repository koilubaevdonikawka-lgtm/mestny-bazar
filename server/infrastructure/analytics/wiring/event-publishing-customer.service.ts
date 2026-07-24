import type { CustomerService } from "@server/application/modules/customer/customer/services";
import type {
  AddCustomerAddressDto,
  CreateCustomerDto,
  CreateCustomerProfileDto,
  DeactivateCustomerDto,
  DeleteCustomerAddressDto,
  SetDefaultAddressDto,
  UpdateCustomerAddressDto,
  UpdateCustomerProfileDto,
  UpdateNotificationSettingsDto,
  VerifyPhoneDto,
} from "@server/application/modules/customer/customer/dto";
import type {
  Customer,
  CustomerAddress,
  CustomerProfile,
} from "@server/application/modules/customer/customer/models";
import { AnalyticsCapabilityEventName } from "@server/application/modules/analytics/analytics/services/analytics-capability-event-names";
import type { CapabilityEventPublisher } from "@server/infrastructure/analytics/capability-event-publisher";

/** Publishes customer capability events without modifying CustomerService business logic. */
export class EventPublishingCustomerService implements CustomerService {
  constructor(
    private readonly inner: CustomerService,
    private readonly publisher: CapabilityEventPublisher,
  ) {}

  createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    return this.inner.createCustomer(dto).then(async (customer) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.CustomerCreated,
        aggregateId: customer.id,
        aggregateType: "Customer",
        payload: {
          customerId: customer.id,
        },
      });
      return customer;
    });
  }

  getCustomer(customerId: string): Promise<Customer | null> {
    return this.inner.getCustomer(customerId);
  }

  getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    return this.inner.getCustomerProfile(customerId);
  }

  createCustomerProfile(dto: CreateCustomerProfileDto): Promise<CustomerProfile> {
    return this.inner.createCustomerProfile(dto);
  }

  updateCustomerProfile(dto: UpdateCustomerProfileDto): Promise<CustomerProfile> {
    return this.inner.updateCustomerProfile(dto);
  }

  addAddress(dto: AddCustomerAddressDto): Promise<CustomerAddress> {
    return this.inner.addAddress(dto);
  }

  updateAddress(dto: UpdateCustomerAddressDto): Promise<CustomerAddress> {
    return this.inner.updateAddress(dto);
  }

  deleteAddress(dto: DeleteCustomerAddressDto): Promise<void> {
    return this.inner.deleteAddress(dto);
  }

  setDefaultAddress(dto: SetDefaultAddressDto): Promise<CustomerAddress> {
    return this.inner.setDefaultAddress(dto);
  }

  getAddresses(customerId: string): Promise<readonly CustomerAddress[]> {
    return this.inner.getAddresses(customerId);
  }

  getDefaultAddress(customerId: string): Promise<CustomerAddress | null> {
    return this.inner.getDefaultAddress(customerId);
  }

  verifyPhone(dto: VerifyPhoneDto): Promise<CustomerProfile> {
    return this.inner.verifyPhone(dto);
  }

  updateNotificationSettings(dto: UpdateNotificationSettingsDto): Promise<CustomerProfile> {
    return this.inner.updateNotificationSettings(dto);
  }

  deactivateCustomer(dto: DeactivateCustomerDto): Promise<Customer> {
    return this.inner.deactivateCustomer(dto);
  }
}

export function asCustomerService(wrapper: EventPublishingCustomerService): CustomerService {
  return wrapper;
}
