import type { IPushNotifier, PushNotificationPayload } from "@server/ports/push-notifier.port";
import { logger } from "@shared/observability/logger";

/** Used when FIREBASE_SERVICE_ACCOUNT_JSON is absent — logs instead of sending, same fallback pattern as StubPaymentProvider/StubNotificationAdapter, so the app is always fully constructible regardless of deployment configuration. */
export class StubPushNotifier implements IPushNotifier {
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<void> {
    logger.info("push:stub", { userId, title: payload.title });
  }
}
