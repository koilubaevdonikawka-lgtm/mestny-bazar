import {
  canModerationRequestBeDecided,
  type ModerationRequest,
} from "@server/application/modules/moderation/moderation/models";

/** Moderation decision business rules. */
export class ModerationPolicy {
  canApprove(request: ModerationRequest): boolean {
    return canModerationRequestBeDecided(request);
  }

  canReject(request: ModerationRequest): boolean {
    return canModerationRequestBeDecided(request);
  }

  canCancel(request: ModerationRequest): boolean {
    return canModerationRequestBeDecided(request);
  }
}
