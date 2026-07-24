import { ApiInfrastructureError } from "@server/api/errors/api.errors";
import type { FinikWebhookHandler } from "@server/infrastructure/finik/webhooks";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readHeader,
} from "@server/api/integration/routing/integration-controller.helpers";

/** Finik webhook HTTP controller — verifies signature and publishes domain events. */
export class FinikWebhookController {
  constructor(private readonly webhookHandler: FinikWebhookHandler) {}

  async handle(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const rawBody = resolveRawBody(context);
    const signature =
      readHeader(context.headers, "x-finik-signature") ??
      readHeader(context.headers, "x-signature") ??
      readHeader(context.headers, "finik-signature") ??
      null;

    const result = await this.webhookHandler.handleAndPublish({
      rawBody,
      signature,
    });

    if (!result.verified) {
      throw new ApiInfrastructureError("Finik webhook signature verification failed", "WEBHOOK_UNAUTHORIZED");
    }

    return createJsonResponse(context, {
      accepted: true,
      eventsPublished: result.events.length,
    });
  }
}

function resolveRawBody(context: ApiRequestContext): string {
  if (typeof context.rawBody === "string" && context.rawBody.length > 0) {
    return context.rawBody;
  }

  if (typeof context.body === "string") {
    return context.body;
  }

  return JSON.stringify(context.body ?? {});
}
