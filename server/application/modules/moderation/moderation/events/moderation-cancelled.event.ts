import type { ModerationRequest } from "@server/application/modules/moderation/moderation/models";

export interface ModerationCancelledEvent {
  readonly type: "moderation.cancelled";
  readonly request: ModerationRequest;
  readonly occurredAt: string;
}

export function createModerationCancelledEvent(
  request: ModerationRequest,
): ModerationCancelledEvent {
  return Object.freeze({
    type: "moderation.cancelled",
    request,
    occurredAt: new Date().toISOString(),
  });
}
