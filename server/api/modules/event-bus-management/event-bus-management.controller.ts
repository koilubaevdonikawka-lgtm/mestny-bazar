import { ApiValidationError } from "@server/api/errors/api.errors";
import type { EventBusManagementApplicationService } from "@server/application/event-bus-management/services/event-bus-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Event bus HTTP controller — event publication and subscription only. */
export class EventBusManagementController {
  constructor(private readonly eventBus: EventBusManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const eventType = readString(body.eventType);
    const description = readString(body.description);
    const source = readString(body.source);

    if (!eventType) {
      throw new ApiValidationError({ eventType: ["eventType is required"] });
    }

    const result = await this.eventBus.registerEvent({
      eventType,
      description: description ?? undefined,
      source: source ?? undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async publish(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const eventType = readString(body.eventType);
    const source = readString(body.source);
    const payload = this.readPayload(body.payload);

    if (!eventType) {
      throw new ApiValidationError({ eventType: ["eventType is required"] });
    }

    const result = await this.eventBus.publishEvent({
      eventType,
      payload,
      source: source ?? undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async subscribe(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const eventType = readString(body.eventType);
    const subscriberId = readString(body.subscriberId);

    if (!eventType) {
      throw new ApiValidationError({ eventType: ["eventType is required"] });
    }
    if (!subscriberId) {
      throw new ApiValidationError({ subscriberId: ["subscriberId is required"] });
    }

    const result = await this.eventBus.subscribeEvent({ eventType, subscriberId });
    return createJsonResponse(context, result.value, 201);
  }

  async unsubscribe(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const subscriptionId = readString(body.subscriptionId);

    if (!subscriptionId) {
      throw new ApiValidationError({ subscriptionId: ["subscriptionId is required"] });
    }

    const result = await this.eventBus.unsubscribeEvent({ subscriptionId });
    return createJsonResponse(context, result.value);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.eventBus.listEvents();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const eventId = this.requireEventId(context);
    const result = await this.eventBus.getEvent(eventId);
    if (!result.value) {
      throw new ApiValidationError({ eventId: [`Event not found: ${eventId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.eventBus.getEventHistory();
    return createJsonResponse(context, result.value);
  }

  async clearHistory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.eventBus.clearEventHistory();
    return createJsonResponse(context, result.value);
  }

  private requireEventId(context: ApiRequestContext): string {
    const eventId = readString(context.params.eventId);
    if (!eventId) {
      throw new ApiValidationError({ eventId: ["eventId is required"] });
    }
    return eventId;
  }

  private readPayload(value: unknown): Readonly<Record<string, string>> | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      throw new ApiValidationError({ payload: ["payload must be an object"] });
    }

    const payload: Record<string, string> = {};
    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (typeof entryValue !== "string") {
        throw new ApiValidationError({ payload: [`payload.${key} must be a string`] });
      }
      payload[key] = entryValue;
    }

    return payload;
  }
}
