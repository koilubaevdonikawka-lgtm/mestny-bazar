import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiProviderRegistryApplicationService } from "@server/application/ai-provider-registry/services/ai-provider-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Provider Registry HTTP controller — provider management only. */
export class AiProviderRegistryController {
  constructor(private readonly providerRegistry: AiProviderRegistryApplicationService) {}

  async registerProvider(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const type = readString(body.type);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }

    const description = readString(body.description);
    const configuration = readString(body.configuration);
    const status = this.readStatus(body.status);

    const result = await this.providerRegistry.registerProvider({
      name,
      type,
      description: description ?? undefined,
      configuration: configuration ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listProviders(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.providerRegistry.listProviders();
    return createJsonResponse(context, result.value);
  }

  async getProvider(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const providerId = this.requireProviderId(context);
    const result = await this.providerRegistry.getProvider(providerId);
    if (!result.value) {
      throw new ApiValidationError({
        providerId: [`Provider not found: ${providerId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateProvider(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const providerId = this.requireProviderId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const type = readString(body.type);
    const description = readString(body.description);
    const configuration = readString(body.configuration);
    const status = this.readStatus(body.status);

    const result = await this.providerRegistry.updateProvider({
      providerId,
      name: name ?? undefined,
      type: type ?? undefined,
      description: description ?? undefined,
      configuration: configuration ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeProvider(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const providerId = this.requireProviderId(context);
    const result = await this.providerRegistry.deleteProvider(providerId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.providerRegistry.findProviderByName(name);
    if (!result.value.provider) {
      throw new ApiValidationError({ name: [`Provider not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByType(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const type = readString(context.params.type);
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }
    const result = await this.providerRegistry.listProvidersByType(type);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.providerRegistry.getProviderRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireProviderId(context: ApiRequestContext): string {
    const providerId = readString(context.params.providerId);
    if (!providerId) {
      throw new ApiValidationError({ providerId: ["providerId is required"] });
    }
    return providerId;
  }

  private readStatus(value: unknown): "active" | "inactive" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "inactive") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'inactive'"] });
  }
}
