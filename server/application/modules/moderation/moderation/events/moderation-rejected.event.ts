import type { ModerationRequest } from "@server/application/modules/moderation/moderation/models";

export interface ModerationRejectedEvent {
  readonly type: "moderation.rejected";
  readonly request: ModerationRequest;
  readonly occurredAt: string;
}

export function createModerationRejectedEvent(
  request: ModerationRequest,
): ModerationRejectedEvent {
  return Object.freeze({
    type: "moderation.rejected",
    request,
    occurredAt: new Date().toISOString(),
  });
}
