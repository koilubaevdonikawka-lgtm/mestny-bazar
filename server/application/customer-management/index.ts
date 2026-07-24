export type { IPhoneVerificationRepository } from "./contracts/phone-verification-repository.contract";
export type {
  IPhoneVerificationProvider,
  PhoneVerificationDeliveryInput,
} from "./contracts/phone-verification-provider.contract";
/** @deprecated Use IPhoneVerificationRepository */
export type { IPhoneVerificationStore } from "./contracts/phone-verification-store.contract";
export {
  CustomerManagementService,
  type RegisterCustomerInput,
  type VerifyPhoneInput,
  type CustomerProfileView,
  type OrderHistoryView,
} from "./services/customer-management.service";
export { CustomerManagementApplicationService } from "./services/customer-management-application.service";
export {
  RegisterCustomerUseCase,
  VerifyPhoneUseCase,
  CreateCustomerProfileUseCase,
  UpdateCustomerProfileUseCase,
  AddCustomerAddressUseCase,
  UpdateCustomerAddressUseCase,
  DeleteCustomerAddressUseCase,
  SetDefaultAddressUseCase,
  GetCustomerAddressesUseCase,
  GetCustomerProfileUseCase,
  UpdateNotificationSettingsUseCase,
  GetOrderHistoryUseCase,
  DeactivateCustomerUseCase,
} from "./use-cases/customer-management.use-cases";
