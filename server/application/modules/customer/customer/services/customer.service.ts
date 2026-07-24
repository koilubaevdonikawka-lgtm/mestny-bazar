import type { ICustomerStore } from "@server/application/modules/customer/customer/contracts";
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
import {
  createCustomerAddressAddedEvent,
  createCustomerAddressUpdatedEvent,
  createCustomerCreatedEvent,
  createCustomerProfileUpdatedEvent,
} from "@server/application/modules/customer/customer/events";
import {
  createCustomer,
  createCustomerAddress,
  createCustomerContact,
  createCustomerProfile,
  CustomerStatus,
  isActiveCustomerStatus,
  normalizeCustomer,
  updateCustomerAddress,
  updateCustomerProfile,
  withCustomerProfile,
  withCustomerProfileNotificationPreferences,
  withCustomerProfilePhoneVerified,
  withCustomerProfilePreferences,
  withCustomerStatus,
  type Customer,
  type CustomerAddress,
  type CustomerProfile,
} from "@server/application/modules/customer/customer/models";
import { applyLegacyNotificationSettingsUpdate } from "@server/application/modules/customer/customer/models/notification-preferences.model";
import type { IIdGenerator } from "@server/application/ports";

/** Customer business capability service — orchestrates customers via ICustomerStore. */
export class CustomerService {
  constructor(
    private readonly store: ICustomerStore,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    validateCreateCustomerDto(dto);

    const customerId = this.idGenerator.generate();
    const profile = createCustomerProfile({
      customerId,
      displayName: dto.displayName,
      contact: createCustomerContact({
        phone: dto.phone,
        email: dto.email,
      }),
    });
    const customer = createCustomer({ id: customerId, profile });

    await this.store.saveCustomer(customer);
    createCustomerCreatedEvent({
      customerId: customer.id,
      displayName: customer.profile.displayName,
    });

    if (dto.defaultAddress) {
      await this.addAddress({
        customerId: customer.id,
        label: dto.defaultAddress.label,
        fullAddress: dto.defaultAddress.fullAddress,
        city: dto.defaultAddress.city,
        district: dto.defaultAddress.district,
        isDefault: true,
      });
    }

    return normalizeCustomer((await this.store.findCustomerById(customer.id)) ?? customer);
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    const customer = await this.store.findCustomerById(customerId.trim());
    return customer ? normalizeCustomer(customer) : null;
  }

  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    const customer = await this.getCustomer(customerId);
    return customer?.profile ?? null;
  }

  async createCustomerProfile(dto: CreateCustomerProfileDto): Promise<CustomerProfile> {
    const customer = await this.requireActiveCustomer(dto.customerId);
    const updatedProfile = withCustomerProfilePreferences(
      updateCustomerProfile(customer.profile, {
        displayName: dto.displayName,
        contact: createCustomerContact({
          phone: customer.profile.contact.phone,
          email: dto.email,
        }),
      }),
      dto.preferences ?? customer.profile.preferences,
    );

    await this.store.updateCustomer(withCustomerProfile(customer, updatedProfile));
    createCustomerProfileUpdatedEvent({
      customerId: customer.id,
      displayName: updatedProfile.displayName,
    });

    return updatedProfile;
  }

  async updateCustomerProfile(dto: UpdateCustomerProfileDto): Promise<CustomerProfile> {
    const customer = await this.requireActiveCustomer(dto.customerId);
    const updatedProfile = updateCustomerProfile(customer.profile, {
      displayName: dto.displayName,
      contact: createCustomerContact({
        phone: dto.phone,
        email: dto.email,
      }),
    });

    await this.store.updateCustomer(withCustomerProfile(customer, updatedProfile));
    createCustomerProfileUpdatedEvent({
      customerId: customer.id,
      displayName: updatedProfile.displayName,
    });

    return updatedProfile;
  }

  async addAddress(dto: AddCustomerAddressDto): Promise<CustomerAddress> {
    validateAddressInput(dto.label, dto.fullAddress);
    await this.requireActiveCustomer(dto.customerId);

    const shouldBeDefault =
      dto.isDefault ?? (await this.store.findAddressesByCustomerId(dto.customerId)).length === 0;

    if (shouldBeDefault) {
      await this.clearDefaultAddress(dto.customerId);
    }

    const address = createCustomerAddress({
      id: this.idGenerator.generate(),
      customerId: dto.customerId,
      label: dto.label,
      fullAddress: dto.fullAddress,
      city: dto.city,
      district: dto.district,
      isDefault: shouldBeDefault,
    });

    await this.store.saveAddress(address);
    createCustomerAddressAddedEvent({
      customerId: address.customerId,
      addressId: address.id,
      isDefault: address.isDefault,
    });

    return address;
  }

  async updateAddress(dto: UpdateCustomerAddressDto): Promise<CustomerAddress> {
    const existing = await this.requireAddress(dto.addressId);
    await this.requireActiveCustomer(existing.customerId);

    if (dto.label !== undefined || dto.fullAddress !== undefined) {
      validateAddressInput(dto.label ?? existing.label, dto.fullAddress ?? existing.fullAddress);
    }

    if (dto.isDefault === true) {
      await this.clearDefaultAddress(existing.customerId, existing.id);
    }

    const updated = updateCustomerAddress(existing, {
      label: dto.label,
      fullAddress: dto.fullAddress,
      city: dto.city,
      district: dto.district,
      isDefault: dto.isDefault,
    });

    await this.store.updateAddress(updated);
    createCustomerAddressUpdatedEvent({
      customerId: updated.customerId,
      addressId: updated.id,
      isDefault: updated.isDefault,
    });

    return updated;
  }

  async getDefaultAddress(customerId: string): Promise<CustomerAddress | null> {
    return this.store.findDefaultAddress(customerId.trim());
  }

  async getAddresses(customerId: string): Promise<readonly CustomerAddress[]> {
    await this.requireActiveCustomer(customerId);
    return this.store.findAddressesByCustomerId(customerId.trim());
  }

  async deleteAddress(dto: DeleteCustomerAddressDto): Promise<void> {
    const address = await this.requireAddress(dto.addressId);
    if (address.customerId !== dto.customerId.trim()) {
      throw new Error(`Address ${dto.addressId} does not belong to customer ${dto.customerId}.`);
    }

    await this.requireActiveCustomer(dto.customerId);
    await this.store.deleteAddress(address.id);

    if (address.isDefault) {
      const remaining = await this.store.findAddressesByCustomerId(dto.customerId);
      const nextDefault = remaining[0];
      if (nextDefault) {
        await this.store.updateAddress(withCustomerAddressDefault(nextDefault, true));
      }
    }
  }

  async setDefaultAddress(dto: SetDefaultAddressDto): Promise<CustomerAddress> {
    const address = await this.requireAddress(dto.addressId);
    if (address.customerId !== dto.customerId.trim()) {
      throw new Error(`Address ${dto.addressId} does not belong to customer ${dto.customerId}.`);
    }

    await this.requireActiveCustomer(dto.customerId);
    await this.clearDefaultAddress(dto.customerId, address.id);

    const updated = withCustomerAddressDefault(address, true);
    await this.store.updateAddress(updated);
    createCustomerAddressUpdatedEvent({
      customerId: updated.customerId,
      addressId: updated.id,
      isDefault: updated.isDefault,
    });

    return updated;
  }

  async verifyPhone(dto: VerifyPhoneDto): Promise<CustomerProfile> {
    const customer = await this.requireActiveCustomer(dto.customerId);
    if (customer.profile.phoneVerified) {
      return customer.profile;
    }

    const updatedProfile = withCustomerProfilePhoneVerified(customer.profile, true);
    await this.store.updateCustomer(withCustomerProfile(customer, updatedProfile));
    return updatedProfile;
  }

  async updateNotificationSettings(dto: UpdateNotificationSettingsDto): Promise<CustomerProfile> {
    const customer = await this.requireActiveCustomer(dto.customerId);
    const updatedProfile = withCustomerProfileNotificationPreferences(
      customer.profile,
      applyLegacyNotificationSettingsUpdate(customer.profile.notificationPreferences, dto),
    );

    await this.store.updateCustomer(withCustomerProfile(customer, updatedProfile));
    return updatedProfile;
  }

  async deactivateCustomer(dto: DeactivateCustomerDto): Promise<Customer> {
    const customer = await this.requireCustomer(dto.customerId);
    if (customer.status === CustomerStatus.Deactivated) {
      return normalizeCustomer(customer);
    }

    const deactivated = withCustomerStatus(customer, CustomerStatus.Deactivated);
    await this.store.updateCustomer(deactivated);
    return normalizeCustomer(deactivated);
  }

  private async requireCustomer(customerId: string): Promise<Customer> {
    const customer = await this.getCustomer(customerId);
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`);
    }
    return customer;
  }

  private async requireActiveCustomer(customerId: string): Promise<Customer> {
    const customer = await this.requireCustomer(customerId);
    if (!isActiveCustomerStatus(customer.status)) {
      throw new Error(`Customer ${customerId} is deactivated.`);
    }
    return customer;
  }

  private async requireAddress(addressId: string): Promise<CustomerAddress> {
    const address = await this.store.findAddressById(addressId.trim());
    if (!address) {
      throw new Error(`Customer address not found: ${addressId}`);
    }
    return address;
  }

  private async clearDefaultAddress(customerId: string, exceptAddressId?: string): Promise<void> {
    const addresses = await this.store.findAddressesByCustomerId(customerId);
    for (const address of addresses) {
      if (address.isDefault && address.id !== exceptAddressId) {
        await this.store.updateAddress(withCustomerAddressDefault(address, false));
      }
    }
  }
}

function validateCreateCustomerDto(dto: CreateCustomerDto): void {
  if (!dto.displayName?.trim()) {
    throw new Error("Customer display name is required.");
  }
  if (!dto.phone?.trim()) {
    throw new Error("Customer phone is required.");
  }
}

function validateAddressInput(label: string, fullAddress: string): void {
  if (!label.trim()) {
    throw new Error("Address label is required.");
  }
  if (!fullAddress.trim()) {
    throw new Error("Full address is required.");
  }
}
