import type {
  DeleteMessageRequest,
  EditMessageRequest,
  INotificationProvider,
  NotificationResponse,
  SendDocumentRequest,
  SendMessageRequest,
  SendPhotoRequest,
} from "@server/infrastructure/notifications";
import type { ITelegramClientProvider } from "@server/infrastructure/telegram/client";
import type { TelegramConfiguration } from "@server/infrastructure/telegram/configuration";
import { NotificationRequestMapper } from "@server/infrastructure/telegram/mappers/notification-request.mapper";
import { NotificationResponseMapper } from "@server/infrastructure/telegram/mappers/notification-response.mapper";
import type { TelegramMessageResource } from "@server/infrastructure/telegram/shared";

/** Telegram implementation of the infrastructure notification port. */
export class TelegramNotificationProvider implements INotificationProvider {
  private readonly requestMapper: NotificationRequestMapper;
  private readonly responseMapper = new NotificationResponseMapper();

  constructor(
    private readonly client: ITelegramClientProvider,
    configuration: TelegramConfiguration,
  ) {
    this.requestMapper = new NotificationRequestMapper(configuration);
    Object.freeze(this);
  }

  async sendMessage(request: SendMessageRequest): Promise<NotificationResponse> {
    const response = await this.client.request<TelegramMessageResource>({
      method: "POST",
      methodName: "sendMessage",
      body: this.requestMapper.toSendMessageBody(request),
    });

    if (!response.data.result) {
      throw new Error("Telegram sendMessage returned an empty result.");
    }

    return this.responseMapper.toSentResponse(response.data.result);
  }

  async sendPhoto(request: SendPhotoRequest): Promise<NotificationResponse> {
    const response = await this.client.request<TelegramMessageResource>({
      method: "POST",
      methodName: "sendPhoto",
      body: this.requestMapper.toSendPhotoBody(request),
    });

    if (!response.data.result) {
      throw new Error("Telegram sendPhoto returned an empty result.");
    }

    return this.responseMapper.toSentResponse(response.data.result);
  }

  async sendDocument(request: SendDocumentRequest): Promise<NotificationResponse> {
    const response = await this.client.request<TelegramMessageResource>({
      method: "POST",
      methodName: "sendDocument",
      body: this.requestMapper.toSendDocumentBody(request),
    });

    if (!response.data.result) {
      throw new Error("Telegram sendDocument returned an empty result.");
    }

    return this.responseMapper.toSentResponse(response.data.result);
  }

  async editMessage(request: EditMessageRequest): Promise<NotificationResponse> {
    const response = await this.client.request<TelegramMessageResource>({
      method: "POST",
      methodName: "editMessageText",
      body: this.requestMapper.toEditMessageBody(request),
    });

    if (!response.data.result) {
      throw new Error("Telegram editMessageText returned an empty result.");
    }

    return this.responseMapper.toEditedResponse(response.data.result);
  }

  async deleteMessage(request: DeleteMessageRequest): Promise<NotificationResponse> {
    await this.client.request<boolean>({
      method: "POST",
      methodName: "deleteMessage",
      body: this.requestMapper.toDeleteMessageBody(request),
    });

    return this.responseMapper.toDeletedResponse(request.target.chatId, request.messageId);
  }
}
