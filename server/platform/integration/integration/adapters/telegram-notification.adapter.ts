import type {
  DeleteMessageRequest,
  EditMessageRequest,
  INotificationProvider,
  NotificationResponse,
  SendDocumentRequest,
  SendMessageRequest,
  SendPhotoRequest,
} from "@server/platform/integration/integration/contracts";
import type { INotificationProvider as InfrastructureNotificationProvider } from "@server/infrastructure/notifications";

/** Adapts infrastructure notification implementations to the platform contract. */
export class TelegramNotificationAdapter implements INotificationProvider {
  constructor(private readonly delegate: InfrastructureNotificationProvider) {}

  sendMessage(request: SendMessageRequest): Promise<NotificationResponse> {
    return this.delegate.sendMessage(request);
  }

  sendPhoto(request: SendPhotoRequest): Promise<NotificationResponse> {
    return this.delegate.sendPhoto(request);
  }

  sendDocument(request: SendDocumentRequest): Promise<NotificationResponse> {
    return this.delegate.sendDocument(request);
  }

  editMessage(request: EditMessageRequest): Promise<NotificationResponse> {
    return this.delegate.editMessage(request);
  }

  deleteMessage(request: DeleteMessageRequest): Promise<NotificationResponse> {
    return this.delegate.deleteMessage(request);
  }
}
