import type { ModerationRequest } from "@server/application/modules/moderation/moderation/models";

export interface ModerationRequestedEvent {
  readonly type: "moderation.requested";
  readonly request: ModerationRequest;
  readonly occurredAt: string;
}

export function createModerationRequestedEvent(
  request: ModerationRequest,
): ModerationRequestedEvent {
  return Object.freeze({
    type: "moderation.requested",
    request,
    occurredAt: new Date().toISOString(),
  });
}
