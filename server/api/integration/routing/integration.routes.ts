import { createFinikWebhookRoutes } from "@server/api/integration/webhooks/finik-webhook.routes";
import { createIntegrationHealthRoutes } from "@server/api/integration/health/integration-health.routes";
import { createNotificationRoutes } from "@server/api/integration/notifications/notification.routes";
import { createPaymentRoutes } from "@server/api/integration/payments/payment.routes";
import { createStorageRoutes } from "@server/api/integration/storage/storage.routes";
import type { FinikWebhookController } from "@server/api/integration/webhooks";
import type { IntegrationHealthController } from "@server/api/integration/health";
import type { NotificationController } from "@server/api/integration/notifications";
import type { PaymentController } from "@server/api/integration/payments";
import type { StorageController } from "@server/api/integration/storage";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export interface IntegrationRouteDependencies {
  payments: PaymentController;
  webhooks: FinikWebhookController;
  notifications: NotificationController;
  storage: StorageController;
  health: IntegrationHealthController;
}

/** Registers all infrastructure integration API routes. */
export function createIntegrationRoutes(
  deps: IntegrationRouteDependencies,
): ApiRouteDefinition[] {
  return Object.freeze([
    ...createPaymentRoutes(deps.payments),
    ...createFinikWebhookRoutes(deps.webhooks),
    ...createNotificationRoutes(deps.notifications),
    ...createStorageRoutes(deps.storage),
    ...createIntegrationHealthRoutes(deps.health),
  ]);
}

export {
  createJsonResponse,
  readHeader,
  readNumber,
  readRecordBody,
  readString,
} from "./integration-controller.helpers";
