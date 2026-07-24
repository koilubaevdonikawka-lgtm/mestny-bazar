import type { ModerationTargetValue } from "@server/application/modules/moderation/moderation/models/moderation-target.model";

export interface CreateModerationRequestDto {
  readonly target: ModerationTargetValue;
  readonly targetId: string;
  readonly requestedBy?: string | null;
}
