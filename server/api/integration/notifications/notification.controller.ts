import { ApiValidationError } from "@server/api/errors/api.errors";
import type { INotificationProvider } from "@server/infrastructure/notifications";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/integration/routing/integration-controller.helpers";

/** Notification HTTP controller — test delivery through the notification port. */
export class NotificationController {
  constructor(private readonly notifications: INotificationProvider) {}

  async sendTest(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const chatId = readString(body.chatId);
    const text = readString(body.text);

    if (!chatId) {
      throw new ApiValidationError({ chatId: ["chatId is required"] });
    }
    if (!text) {
      throw new ApiValidationError({ text: ["text is required"] });
    }

    const response = await this.notifications.sendMessage({
      target: Object.freeze({ chatId }),
      text,
      parseMode: readString(body.parseMode) as "HTML" | "Markdown" | "MarkdownV2" | undefined,
    });

    return createJsonResponse(context, response, 201);
  }
}
