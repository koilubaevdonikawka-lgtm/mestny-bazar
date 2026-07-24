import type { ApplicationDomainEvent } from "@server/application/shared";
import type { IEventBus } from "@server/application/ports";
import type { FinikConfiguration } from "@server/infrastructure/finik/configuration";
import { FinikWebhookMapper } from "@server/infrastructure/finik/webhooks/finik-webhook-mapper";
import type { FinikWebhookPayload } from "@server/infrastructure/finik/shared";
import { FinikWebhookVerifier } from "@server/infrastructure/finik/webhooks/finik-webhook-verifier";

export interface FinikWebhookInput {
  rawBody: string;
  signature: string | null;
}

export interface FinikWebhookResult {
  verified: boolean;
  events: readonly ApplicationDomainEvent[];
}

/** Handles Finik webhook ingestion and domain event publication. */
export class FinikWebhookHandler {
  private readonly verifier: FinikWebhookVerifier;
  private readonly mapper = new FinikWebhookMapper();

  constructor(
    configuration: FinikConfiguration,
    private readonly eventBus?: IEventBus,
  ) {
    this.verifier = new FinikWebhookVerifier(configuration);
    Object.freeze(this);
  }

  parsePayload(rawBody: string): FinikWebhookPayload {
    return JSON.parse(rawBody) as FinikWebhookPayload;
  }

  handle(input: FinikWebhookInput): FinikWebhookResult {
    const verified = this.verifier.verify(input.rawBody, input.signature);
    if (!verified) {
      return Object.freeze({ verified: false, events: Object.freeze([]) });
    }

    const payload = this.parsePayload(input.rawBody);
    const events = this.mapper.toDomainEvents(payload);
    return Object.freeze({ verified: true, events });
  }

  async handleAndPublish(input: FinikWebhookInput): Promise<FinikWebhookResult> {
    const result = this.handle(input);
    if (result.verified && this.eventBus && result.events.length > 0) {
      await this.eventBus.publishAll(result.events);
    }
    return result;
  }
}
