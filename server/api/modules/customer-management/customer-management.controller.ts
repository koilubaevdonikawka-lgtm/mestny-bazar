import { ApiValidationError } from "@server/api/errors/api.errors";
import type { CustomerManagementApplicationService } from "@server/application/customer-management/services/customer-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Customer management HTTP controller. */
export class CustomerManagementController {
  constructor(private readonly customers: CustomerManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const displayName = readString(body.displayName);
    const phone = readString(body.phone);
    if (!displayName) {
      throw new ApiValidationError({ displayName: ["displayName is required"] });
    }
    if (!phone) {
      throw new ApiValidationError({ phone: ["phone is required"] });
    }

    const result = await this.customers.register({
      displayName,
      phone,
      email: readString(body.email),
    });
    return createJsonResponse(context, result.value, 201);
  }

  async verifyPhone(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = readString(body.customerId) ?? resolveCustomerId(context, body);
    const code = readString(body.code);
    if (!code) {
      throw new ApiValidationError({ code: ["code is required"] });
    }

    const result = await this.customers.verifyPhone({ customerId, code });
    return createJsonResponse(context, result.value);
  }

  async getProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context, readRecordBody(context.body));
    const result = await this.customers.getProfile(customerId);
    return createJsonResponse(context, result.value);
  }

  async updateProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const displayName = readString(body.displayName);
    const phone = readString(body.phone);
    if (!displayName) {
      throw new ApiValidationError({ displayName: ["displayName is required"] });
    }
    if (!phone) {
      throw new ApiValidationError({ phone: ["phone is required"] });
    }

    const result = await this.customers.updateProfile({
      customerId,
      displayName,
      phone,
      email: body.email === null ? null : readString(body.email),
    });
    return createJsonResponse(context, result.value);
  }

  async listAddresses(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context, readRecordBody(context.body));
    const result = await this.customers.getAddresses(customerId);
    return createJsonResponse(context, result.value);
  }

  async addAddress(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const label = readString(body.label);
    const fullAddress = readString(body.fullAddress);
    if (!label) {
      throw new ApiValidationError({ label: ["label is required"] });
    }
    if (!fullAddress) {
      throw new ApiValidationError({ fullAddress: ["fullAddress is required"] });
    }

    const result = await this.customers.addAddress({
      customerId,
      label,
      fullAddress,
      city: readString(body.city),
      district: readString(body.district),
      isDefault: body.isDefault === true,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async updateAddress(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const addressId = this.requireAddressId(context);
    const body = readRecordBody(context.body);
    resolveCustomerId(context, body);

    const result = await this.customers.updateAddress({
      addressId,
      label: readString(body.label),
      fullAddress: readString(body.fullAddress),
      city: body.city === null ? null : readString(body.city),
      district: body.district === null ? null : readString(body.district),
      isDefault: typeof body.isDefault === "boolean" ? body.isDefault : undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async deleteAddress(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const addressId = this.requireAddressId(context);
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const result = await this.customers.deleteAddress({ customerId, addressId });
    return createJsonResponse(context, result.value);
  }

  async setDefaultAddress(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const addressId = this.requireAddressId(context);
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const result = await this.customers.setDefaultAddress({ customerId, addressId });
    return createJsonResponse(context, result.value);
  }

  async updateNotificationSettings(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const result = await this.customers.updateNotificationSettings({
      customerId,
      orderUpdates: typeof body.orderUpdates === "boolean" ? body.orderUpdates : undefined,
      promotions: typeof body.promotions === "boolean" ? body.promotions : undefined,
      smsEnabled: typeof body.smsEnabled === "boolean" ? body.smsEnabled : undefined,
      emailEnabled: typeof body.emailEnabled === "boolean" ? body.emailEnabled : undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async orderHistory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context, readRecordBody(context.body));
    const result = await this.customers.getOrderHistory(customerId);
    return createJsonResponse(context, result.value);
  }

  async deactivate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const result = await this.customers.deactivate({
      customerId,
      reason: readString(body.reason),
    });
    return createJsonResponse(context, result.value);
  }

  private requireAddressId(context: ApiRequestContext): string {
    const addressId = context.params.id;
    if (!addressId?.trim()) {
      throw new ApiValidationError({ id: ["Address id is required"] });
    }
    return addressId;
  }
}
