import {
  ModerationTarget,
  type ModerationRequest,
  type ModerationTargetValue,
} from "@server/application/modules/moderation/moderation/models";

/** Rules for automatic moderation decisions before manual review. */
export class AutoModerationPolicy {
  shouldAutoApprove(_request: ModerationRequest): boolean {
    return false;
  }

  supportsAutoModeration(target: ModerationTargetValue): boolean {
    return (
      target === ModerationTarget.Product ||
      target === ModerationTarget.Review ||
      target === ModerationTarget.Complaint
    );
  }
}
