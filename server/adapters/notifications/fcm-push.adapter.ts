import type { IDeviceTokenRepository } from "@server/ports/device-token.repository";
import type { IPushNotifier, PushNotificationPayload } from "@server/ports/push-notifier.port";
import {
  getGoogleAccessToken,
  type GoogleServiceAccount,
} from "@server/adapters/notifications/google-service-account-jwt";
import { logger } from "@shared/observability/logger";

/** FCM HTTP v1 error envelope — https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode. */
interface FcmErrorBody {
  error?: {
    status?: string;
    details?: Array<{ errorCode?: string }>;
  };
}

/** UNREGISTERED (token no longer exists on the device) / INVALID_ARGUMENT (malformed token) — the token itself is dead, not a transient failure. */
function isDeadTokenError(body: unknown): boolean {
  const error = (body as FcmErrorBody | null)?.error;
  if (!error) return false;
  if (error.status === "NOT_FOUND" || error.status === "INVALID_ARGUMENT") return true;
  return (error.details ?? []).some(
    (detail) => detail.errorCode === "UNREGISTERED" || detail.errorCode === "INVALID_ARGUMENT",
  );
}

/**
 * Задача №215 — sends push via FCM HTTP v1, subscribed to the marketplace
 * event bus (not INotificationProvider/NotificationCenter, see push-notifier.port.ts).
 * Every failure mode is caught and logged, never thrown — per
 * IPushNotifier's contract, push is a side effect of the order flow that
 * publishes these events, never allowed to affect it.
 */
export class FcmPushAdapter implements IPushNotifier {
  constructor(
    private readonly account: GoogleServiceAccount,
    private readonly deviceTokens: IDeviceTokenRepository,
  ) {}

  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<void> {
    let tokens: Awaited<ReturnType<IDeviceTokenRepository["listByUserId"]>>;
    try {
      tokens = await this.deviceTokens.listByUserId(userId);
    } catch (error) {
      logger.error("push:list-tokens-failed", { userId, error });
      return;
    }
    if (tokens.length === 0) return;

    let accessToken: string;
    try {
      accessToken = await getGoogleAccessToken(this.account);
    } catch (error) {
      logger.error("push:access-token-failed", { userId, error });
      return;
    }

    await Promise.all(
      tokens.map((deviceToken) =>
        this.sendToToken(accessToken, deviceToken.token, payload, userId),
      ),
    );
  }

  private async sendToToken(
    accessToken: string,
    token: string,
    payload: PushNotificationPayload,
    userId: string,
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${this.account.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title: payload.title, body: payload.body },
              ...(payload.data ? { data: payload.data } : {}),
            },
          }),
        },
      );

      if (response.ok) return;

      const errorBody: unknown = await response.json().catch(() => null);

      if (isDeadTokenError(errorBody)) {
        logger.info("push:removing_dead_token", { userId, tokenPrefix: token.slice(0, 12) });
        await this.deviceTokens.deleteByToken(token).catch((error) => {
          logger.error("push:delete-token-failed", { userId, error });
        });
        return;
      }

      logger.error("push:send-failed", { userId, status: response.status, errorBody });
    } catch (error) {
      logger.error("push:send-threw", { userId, error });
    }
  }
}
