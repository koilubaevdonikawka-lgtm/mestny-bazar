import type { ApplicationDomainEvent } from "@server/application/shared";
import type { FinikWebhookPayload } from "@server/infrastructure/finik/shared";
import { WebhookEventMapper } from "@server/infrastructure/finik/mappers/webhook-event.mapper";

/** Maps Finik webhook payloads to application domain event envelopes. */
export class FinikWebhookMapper {
  private readonly delegate = new WebhookEventMapper();

  toDomainEvents(payload: FinikWebhookPayload): ApplicationDomainEvent[] {
    return this.delegate.toDomainEvents(payload);
  }
}

export type { FinikWebhookPayload };
