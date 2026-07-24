import type {
  DeleteMessageRequest,
  EditMessageRequest,
  INotificationProvider,
  NotificationResponse,
  SendDocumentRequest,
  SendMessageRequest,
  SendPhotoRequest,
} from "@server/infrastructure/notifications/notification-provider.port";

/** No-op notification provider for local development and tests. */
export class NoopNotificationProvider implements INotificationProvider {
  async sendMessage(request: SendMessageRequest): Promise<NotificationResponse> {
    return Object.freeze({
      messageId: 0,
      chatId: request.target.chatId,
      status: "sent",
    });
  }

  async sendPhoto(request: SendPhotoRequest): Promise<NotificationResponse> {
    return Object.freeze({
      messageId: 0,
      chatId: request.target.chatId,
      status: "sent",
    });
  }

  async sendDocument(request: SendDocumentRequest): Promise<NotificationResponse> {
    return Object.freeze({
      messageId: 0,
      chatId: request.target.chatId,
      status: "sent",
    });
  }

  async editMessage(request: EditMessageRequest): Promise<NotificationResponse> {
    return Object.freeze({
      messageId: request.messageId,
      chatId: request.target.chatId,
      status: "edited",
    });
  }

  async deleteMessage(request: DeleteMessageRequest): Promise<NotificationResponse> {
    return Object.freeze({
      messageId: request.messageId,
      chatId: request.target.chatId,
      status: "deleted",
    });
  }
}
