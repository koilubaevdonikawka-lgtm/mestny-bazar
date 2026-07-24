import { ApiValidationError } from "@server/api/errors/api.errors";
import type { NotificationManagementApplicationService } from "@server/application/notification-management/services/notification-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readQueryString,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Notification management HTTP controller — delivery lifecycle only. */
export class NotificationManagementController {
  constructor(private readonly notifications: NotificationManagementApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const recipientId = readString(body.recipientId) ?? resolveCustomerId(context);
    const channel = readString(body.channel);
    const templateKey = readString(body.templateKey);

    if (!channel) {
      throw new ApiValidationError({ channel: ["channel is required"] });
    }
    if (!templateKey) {
      throw new ApiValidationError({ templateKey: ["templateKey is required"] });
    }

    const variables = readTemplateVariables(body.variables);

    const result = await this.notifications.createNotification({
      recipientId,
      channel,
      templateKey,
      variables,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async send(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const notificationId = this.requireNotificationId(context);
    const result = await this.notifications.sendNotification(notificationId);
    return createJsonResponse(context, result.value);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const recipientId =
      readQueryString(context.query, "recipientId") ??
      readQueryString(context.query, "customerId");
    const result = await this.notifications.getNotifications(recipientId ?? undefined);
    return createJsonResponse(context, result.value);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const notificationId = this.requireNotificationId(context);
    const result = await this.notifications.getNotification(notificationId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async retry(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const notificationId = this.requireNotificationId(context);
    const result = await this.notifications.retryNotification(notificationId);
    return createJsonResponse(context, result.value);
  }

  async cancel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const notificationId = this.requireNotificationId(context);
    const body = readRecordBody(context.body);
    const result = await this.notifications.cancelNotification(
      notificationId,
      readString(body.reason),
    );
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const notificationId = this.requireNotificationId(context);
    const result = await this.notifications.getHistory(notificationId);
    return createJsonResponse(context, result.value);
  }

  private requireNotificationId(context: ApiRequestContext): string {
    const notificationId = readString(context.params.notificationId);
    if (!notificationId) {
      throw new ApiValidationError({ notificationId: ["notificationId is required"] });
    }
    return notificationId;
  }
}

function readTemplateVariables(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const variables: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      variables[key] = entry;
    }
  }

  return Object.keys(variables).length > 0 ? variables : undefined;
}
