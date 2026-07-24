import type { ModerationTargetValue } from "@server/application/modules/moderation/moderation/models/moderation-target.model";

export interface ApproveModerationDto {
  readonly requestId?: string;
  readonly target?: ModerationTargetValue;
  readonly targetId?: string;
}
