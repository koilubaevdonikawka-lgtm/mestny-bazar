/**
 * Задача №215 — deliberately NOT `INotificationProvider` (notification.provider.ts):
 * that port is shaped around a single operational-role broadcast per order
 * (`sendOrderUpdate(order, message)`, fed by fixed Telegram chat IDs), with
 * no concept of "which user". Push is addressed to one specific buyer's own
 * device(s) (device_tokens, keyed by auth user id) — a different shape,
 * hence its own port.
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  /** FCM string-only data payload — order id/number/status, for the app to deep-link on tap. */
  data?: Record<string, string>;
}

export interface IPushNotifier {
  /** Resolves the user's device_tokens itself and sends to every one of them. Never throws — a send failure is logged, not propagated (push is a side effect, never blocks the order flow it's attached to). */
  sendToUser(userId: string, payload: PushNotificationPayload): Promise<void>;
}
