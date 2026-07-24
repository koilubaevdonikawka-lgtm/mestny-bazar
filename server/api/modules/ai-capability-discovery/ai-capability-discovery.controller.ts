import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiCapabilityDiscoveryApplicationService } from "@server/application/ai-capability-discovery/services/ai-capability-discovery-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Capability Discovery HTTP controller — capability registration and lookup only. */
export class AiCapabilityDiscoveryController {
  constructor(private readonly discovery: AiCapabilityDiscoveryApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const category = readString(body.category);
    const status = this.readStatus(body.status);

    const result = await this.discovery.registerCapability({
      name,
      description: description ?? undefined,
      category: category ?? undefined,
      definition: "definition" in body ? body.definition : undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.discovery.listCapabilities();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const capabilityId = this.requireCapabilityId(context);
    const result = await this.discovery.getCapability(capabilityId);
    if (!result.value) {
      throw new ApiValidationError({
        capabilityId: [`Capability not found: ${capabilityId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async update(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const capabilityId = this.requireCapabilityId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const description = readString(body.description);
    const category = readString(body.category);
    const status = this.readStatus(body.status);

    const result = await this.discovery.updateCapability({
      capabilityId,
      name: name ?? undefined,
      description: description ?? undefined,
      category: category ?? undefined,
      definition: "definition" in body ? body.definition : undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const capabilityId = this.requireCapabilityId(context);
    const result = await this.discovery.deleteCapability(capabilityId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.discovery.findCapabilityByName(name);
    if (!result.value.capability) {
      throw new ApiValidationError({ name: [`Capability not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.discovery.listCapabilitiesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.discovery.getCapabilityStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireCapabilityId(context: ApiRequestContext): string {
    const capabilityId = readString(context.params.capabilityId);
    if (!capabilityId) {
      throw new ApiValidationError({ capabilityId: ["capabilityId is required"] });
    }
    return capabilityId;
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
