import type { ServerEnv } from "@server/config/env";
import type { IDeviceTokenRepository } from "@server/ports/device-token.repository";
import type { IPushNotifier } from "@server/ports/push-notifier.port";
import { FcmPushAdapter } from "@server/adapters/notifications/fcm-push.adapter";
import { StubPushNotifier } from "@server/adapters/notifications/stub-push.notifier";
import { parseGoogleServiceAccount } from "@server/adapters/notifications/google-service-account-jwt";
import { logger } from "@shared/observability/logger";

/**
 * Задача №215 — same decision-point shape as createPaymentProvider
 * (payment-provider.factory.ts): real FCM only when the secret is present
 * and well-formed, otherwise the safe stub, so the app is always fully
 * constructible regardless of deployment configuration.
 */
export function createPushNotifier(
  env: ServerEnv,
  deviceTokens: IDeviceTokenRepository,
): IPushNotifier {
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return new StubPushNotifier();
  }

  try {
    const account = parseGoogleServiceAccount(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return new FcmPushAdapter(account, deviceTokens);
  } catch (error) {
    logger.error("push:invalid-service-account", { error });
    return new StubPushNotifier();
  }
}
