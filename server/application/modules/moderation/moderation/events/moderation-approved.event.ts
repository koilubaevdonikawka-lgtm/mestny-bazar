import type { ModerationRequest } from "@server/application/modules/moderation/moderation/models";

export interface ModerationApprovedEvent {
  readonly type: "moderation.approved";
  readonly request: ModerationRequest;
  readonly occurredAt: string;
}

export function createModerationApprovedEvent(
  request: ModerationRequest,
): ModerationApprovedEvent {
  return Object.freeze({
    type: "moderation.approved",
    request,
    occurredAt: new Date().toISOString(),
  });
}
