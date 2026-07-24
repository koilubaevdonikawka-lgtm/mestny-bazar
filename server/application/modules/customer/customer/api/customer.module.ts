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
import type { CustomerService } from "@server/application/modules/customer/customer/services";
import type {
  CreateComplaintDto,
  CreateSuggestionDto,
  CreateTicketDto,
} from "@server/application/modules/support/support/dto";
import type {
  Complaint,
  Suggestion,
  SupportTicket,
} from "@server/application/modules/support/support/models";
import type { SupportModule } from "@server/application/modules/support/support/api/support.module";

/** Public entry point for the Customer business capability module. */
export class CustomerModule {
  constructor(
    private readonly service: CustomerService,
    private readonly support: SupportModule,
  ) {}

  createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    return this.service.createCustomer(dto);
  }

  getCustomer(customerId: string): Promise<Customer | null> {
    return this.service.getCustomer(customerId);
  }

  getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    return this.service.getCustomerProfile(customerId);
  }

  createCustomerProfile(dto: CreateCustomerProfileDto): Promise<CustomerProfile> {
    return this.service.createCustomerProfile(dto);
  }

  updateCustomerProfile(dto: UpdateCustomerProfileDto): Promise<CustomerProfile> {
    return this.service.updateCustomerProfile(dto);
  }

  addAddress(dto: AddCustomerAddressDto): Promise<CustomerAddress> {
    return this.service.addAddress(dto);
  }

  updateAddress(dto: UpdateCustomerAddressDto): Promise<CustomerAddress> {
    return this.service.updateAddress(dto);
  }

  deleteAddress(dto: DeleteCustomerAddressDto): Promise<void> {
    return this.service.deleteAddress(dto);
  }

  setDefaultAddress(dto: SetDefaultAddressDto): Promise<CustomerAddress> {
    return this.service.setDefaultAddress(dto);
  }

  getAddresses(customerId: string): Promise<readonly CustomerAddress[]> {
    return this.service.getAddresses(customerId);
  }

  getDefaultAddress(customerId: string): Promise<CustomerAddress | null> {
    return this.service.getDefaultAddress(customerId);
  }

  verifyPhone(dto: VerifyPhoneDto): Promise<CustomerProfile> {
    return this.service.verifyPhone(dto);
  }

  updateNotificationSettings(dto: UpdateNotificationSettingsDto): Promise<CustomerProfile> {
    return this.service.updateNotificationSettings(dto);
  }

  deactivateCustomer(dto: DeactivateCustomerDto): Promise<Customer> {
    return this.service.deactivateCustomer(dto);
  }

  createTicket(dto: CreateTicketDto): Promise<SupportTicket> {
    return this.support.createTicket(dto);
  }

  createComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    return this.support.createComplaint(dto);
  }

  createSuggestion(dto: CreateSuggestionDto): Promise<Suggestion> {
    return this.support.createSuggestion(dto);
  }
}
