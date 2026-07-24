import type {
  Customer,
  CustomerAddress,
  CustomerProfile,
} from "@server/application/modules/customer/customer/models";
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
  CustomerManagementService,
  CustomerProfileView,
  OrderHistoryView,
  RegisterCustomerInput,
  VerifyPhoneInput,
} from "@server/application/customer-management/services/customer-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterCustomerUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: RegisterCustomerInput): Promise<UseCaseResult<Customer>> {
    return this.management.register(input).then((result) => useCaseResult(result.customer));
  }
}

export class VerifyPhoneUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: VerifyPhoneInput): Promise<UseCaseResult<CustomerProfile>> {
    return this.management.verifyPhone(input).then(useCaseResult);
  }
}

export class CreateCustomerProfileUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: CreateCustomerProfileDto): Promise<UseCaseResult<CustomerProfile>> {
    return this.management.createProfile(input).then(useCaseResult);
  }
}

export class UpdateCustomerProfileUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: UpdateCustomerProfileDto): Promise<UseCaseResult<CustomerProfile>> {
    return this.management.updateProfile(input).then(useCaseResult);
  }
}

export class AddCustomerAddressUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: AddCustomerAddressDto): Promise<UseCaseResult<CustomerAddress>> {
    return this.management.addAddress(input).then(useCaseResult);
  }
}

export class UpdateCustomerAddressUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: UpdateCustomerAddressDto): Promise<UseCaseResult<CustomerAddress>> {
    return this.management.updateAddress(input).then(useCaseResult);
  }
}

export class DeleteCustomerAddressUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  async execute(input: DeleteCustomerAddressDto): Promise<UseCaseResult<{ deleted: true }>> {
    await this.management.deleteAddress(input);
    return useCaseResult({ deleted: true as const });
  }
}

export class SetDefaultAddressUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: SetDefaultAddressDto): Promise<UseCaseResult<CustomerAddress>> {
    return this.management.setDefaultAddress(input).then(useCaseResult);
  }
}

export class GetCustomerAddressesUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<readonly CustomerAddress[]>> {
    return this.management.getAddresses(customerId).then(useCaseResult);
  }
}

export class GetCustomerProfileUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<CustomerProfileView>> {
    return this.management.getProfile(customerId).then(useCaseResult);
  }
}

export class UpdateNotificationSettingsUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: UpdateNotificationSettingsDto): Promise<UseCaseResult<CustomerProfile>> {
    return this.management.updateNotificationSettings(input).then(useCaseResult);
  }
}

export class GetOrderHistoryUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<OrderHistoryView>> {
    return this.management.getOrderHistory(customerId).then(useCaseResult);
  }
}

export class DeactivateCustomerUseCase {
  constructor(private readonly management: CustomerManagementService) {}

  execute(input: DeactivateCustomerDto): Promise<UseCaseResult<Customer>> {
    return this.management.deactivate(input).then(useCaseResult);
  }
}
