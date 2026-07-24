import type {
  AddCustomerAddressDto,
  CreateCustomerProfileDto,
  DeactivateCustomerDto,
  DeleteCustomerAddressDto,
  SetDefaultAddressDto,
  UpdateCustomerAddressDto,
  UpdateCustomerProfileDto,
  UpdateNotificationSettingsDto,
} from "@server/application/modules/customer/customer/dto";
import type {
  RegisterCustomerInput,
  VerifyPhoneInput,
} from "@server/application/customer-management/services/customer-management.service";
import {
  AddCustomerAddressUseCase,
  CreateCustomerProfileUseCase,
  DeactivateCustomerUseCase,
  DeleteCustomerAddressUseCase,
  GetCustomerAddressesUseCase,
  GetCustomerProfileUseCase,
  GetOrderHistoryUseCase,
  RegisterCustomerUseCase,
  SetDefaultAddressUseCase,
  UpdateCustomerAddressUseCase,
  UpdateCustomerProfileUseCase,
  UpdateNotificationSettingsUseCase,
  VerifyPhoneUseCase,
} from "@server/application/customer-management/use-cases/customer-management.use-cases";

/** Application facade for customer management scenario. */
export class CustomerManagementApplicationService {
  constructor(
    private readonly registerCustomerUseCase: RegisterCustomerUseCase,
    private readonly verifyPhoneUseCase: VerifyPhoneUseCase,
    private readonly createCustomerProfileUseCase: CreateCustomerProfileUseCase,
    private readonly updateCustomerProfileUseCase: UpdateCustomerProfileUseCase,
    private readonly addCustomerAddressUseCase: AddCustomerAddressUseCase,
    private readonly updateCustomerAddressUseCase: UpdateCustomerAddressUseCase,
    private readonly deleteCustomerAddressUseCase: DeleteCustomerAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
    private readonly getCustomerAddressesUseCase: GetCustomerAddressesUseCase,
    private readonly getCustomerProfileUseCase: GetCustomerProfileUseCase,
    private readonly updateNotificationSettingsUseCase: UpdateNotificationSettingsUseCase,
    private readonly getOrderHistoryUseCase: GetOrderHistoryUseCase,
    private readonly deactivateCustomerUseCase: DeactivateCustomerUseCase,
  ) {}

  register(input: RegisterCustomerInput) {
    return this.registerCustomerUseCase.execute(input);
  }

  verifyPhone(input: VerifyPhoneInput) {
    return this.verifyPhoneUseCase.execute(input);
  }

  createProfile(input: CreateCustomerProfileDto) {
    return this.createCustomerProfileUseCase.execute(input);
  }

  updateProfile(input: UpdateCustomerProfileDto) {
    return this.updateCustomerProfileUseCase.execute(input);
  }

  getProfile(customerId: string) {
    return this.getCustomerProfileUseCase.execute(customerId);
  }

  getAddresses(customerId: string) {
    return this.getCustomerAddressesUseCase.execute(customerId);
  }

  addAddress(input: AddCustomerAddressDto) {
    return this.addCustomerAddressUseCase.execute(input);
  }

  updateAddress(input: UpdateCustomerAddressDto) {
    return this.updateCustomerAddressUseCase.execute(input);
  }

  deleteAddress(input: DeleteCustomerAddressDto) {
    return this.deleteCustomerAddressUseCase.execute(input);
  }

  setDefaultAddress(input: SetDefaultAddressDto) {
    return this.setDefaultAddressUseCase.execute(input);
  }

  updateNotificationSettings(input: UpdateNotificationSettingsDto) {
    return this.updateNotificationSettingsUseCase.execute(input);
  }

  getOrderHistory(customerId: string) {
    return this.getOrderHistoryUseCase.execute(customerId);
  }

  deactivate(input: DeactivateCustomerDto) {
    return this.deactivateCustomerUseCase.execute(input);
  }
}
