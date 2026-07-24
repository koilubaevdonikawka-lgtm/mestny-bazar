/**
 * Customer Management begins at user registration.
 *
 * Onboarding Boundary:
 * - Experience Engine and future Onboarding Module own the journey BEFORE registration.
 * - Customer Management owns identity, profile, addresses, and post-registration lifecycle.
 * - REST API routes from Stage 89 remain unchanged; this boundary is architectural only.
 */
import type { AnalyticsModule } from "@server/application/modules/analytics/analytics/api/analytics.module";
import type { CustomerModule } from "@server/application/modules/customer/customer/api/customer.module";
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
} from "@server/application/modules/customer/customer/dto";
import type {
  Customer,
  CustomerAddress,
  CustomerProfile,
} from "@server/application/modules/customer/customer/models";
import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import {
  createNotificationRecipient,
  NotificationChannel,
  NotificationRecipientType,
} from "@server/application/modules/notification/notification/models";
import type { Order } from "@server/application/modules/order/order/models";
import type { IOrderStore } from "@server/application/modules/order/order/contracts";
import type { IPhoneVerificationRepository } from "@server/application/customer-management/contracts/phone-verification-repository.contract";
import type { IPhoneVerificationProvider } from "@server/application/customer-management/contracts/phone-verification-provider.contract";
import type { CustomerMetrics } from "@server/application/modules/analytics/analytics/models";

export interface RegisterCustomerInput {
  readonly displayName: string;
  readonly phone: string;
  readonly email?: string | null;
}

export interface VerifyPhoneInput {
  readonly customerId: string;
  readonly code: string;
}

export interface CustomerProfileView {
  readonly customer: Customer;
  readonly profile: CustomerProfile;
  readonly metrics: CustomerMetrics | null;
}

export interface OrderHistoryView {
  readonly orders: readonly Order[];
  readonly metrics: CustomerMetrics | null;
}

/** Orchestrates customer lifecycle across Customer, Order, Notification, and Analytics BCM. */
export class CustomerManagementService {
  constructor(
    private readonly customers: CustomerModule,
    private readonly orderStore: IOrderStore,
    private readonly notifications: NotificationModule,
    private readonly analytics: AnalyticsModule,
    private readonly phoneVerificationRepository: IPhoneVerificationRepository,
    private readonly phoneVerificationProvider: IPhoneVerificationProvider,
  ) {}

  async register(input: RegisterCustomerInput): Promise<{ customer: Customer; verificationCode: string }> {
    const dto: CreateCustomerDto = {
      displayName: input.displayName,
      phone: input.phone,
      email: input.email,
    };

    const customer = await this.customers.createCustomer(dto);
    const verificationCode = generateVerificationCode();
    await this.phoneVerificationRepository.saveCode(customer.id, verificationCode);
    await this.phoneVerificationProvider.sendVerificationCode({
      customerId: customer.id,
      phone: customer.profile.contact.phone,
      code: verificationCode,
    });

    return { customer, verificationCode };
  }

  async verifyPhone(input: VerifyPhoneInput): Promise<CustomerProfile> {
    const valid = await this.phoneVerificationRepository.verify(input.customerId, input.code);
    if (!valid) {
      throw new Error("Invalid phone verification code.");
    }

    const profile = await this.customers.verifyPhone({
      customerId: input.customerId,
      code: input.code,
    });
    await this.phoneVerificationRepository.delete(input.customerId);
    return profile;
  }

  createProfile(dto: CreateCustomerProfileDto): Promise<CustomerProfile> {
    return this.customers.createCustomerProfile(dto);
  }

  updateProfile(dto: UpdateCustomerProfileDto): Promise<CustomerProfile> {
    return this.customers.updateCustomerProfile(dto);
  }

  async getProfile(customerId: string): Promise<CustomerProfileView> {
    const customer = await this.requireCustomer(customerId);
    const profile = customer.profile;
    const metrics = await this.safeCustomerMetrics();

    return { customer, profile, metrics };
  }

  addAddress(dto: AddCustomerAddressDto): Promise<CustomerAddress> {
    return this.customers.addAddress(dto);
  }

  updateAddress(dto: UpdateCustomerAddressDto): Promise<CustomerAddress> {
    return this.customers.updateAddress(dto);
  }

  deleteAddress(dto: DeleteCustomerAddressDto): Promise<void> {
    return this.customers.deleteAddress(dto);
  }

  setDefaultAddress(dto: SetDefaultAddressDto): Promise<CustomerAddress> {
    return this.customers.setDefaultAddress(dto);
  }

  getAddresses(customerId: string): Promise<readonly CustomerAddress[]> {
    return this.customers.getAddresses(customerId);
  }

  updateNotificationSettings(dto: UpdateNotificationSettingsDto): Promise<CustomerProfile> {
    return this.customers.updateNotificationSettings(dto);
  }

  async getOrderHistory(customerId: string): Promise<OrderHistoryView> {
    await this.requireCustomer(customerId);
    const orders = await this.orderStore.findByCustomerId(customerId);
    const metrics = await this.safeCustomerMetrics();
    return { orders, metrics };
  }

  async deactivate(dto: DeactivateCustomerDto): Promise<Customer> {
    const customer = await this.customers.deactivateCustomer(dto);
    await this.phoneVerificationRepository.delete(dto.customerId);

    if (customer.profile.contact.email) {
      await this.notifications
        .send({
          channel: NotificationChannel.Email,
          recipient: createNotificationRecipient({
            type: NotificationRecipientType.Customer,
            id: customer.id,
            address: customer.profile.contact.email,
          }),
          subject: "Account deactivated",
          body: dto.reason
            ? `Your account has been deactivated. Reason: ${dto.reason}`
            : "Your account has been deactivated.",
        })
        .catch(() => undefined);
    }

    return customer;
  }

  private async requireCustomer(customerId: string): Promise<Customer> {
    const customer = await this.customers.getCustomer(customerId);
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    return customer;
  }

  private async safeCustomerMetrics(): Promise<CustomerMetrics | null> {
    return this.analytics.getCustomerMetrics().catch(() => null);
  }
}

function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
