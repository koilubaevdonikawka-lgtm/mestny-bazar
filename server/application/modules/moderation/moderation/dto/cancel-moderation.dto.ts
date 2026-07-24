import type { ModerationTargetValue } from "@server/application/modules/moderation/moderation/models/moderation-target.model";

export interface CancelModerationDto {
  readonly requestId?: string;
  readonly target?: ModerationTargetValue;
  readonly targetId?: string;
  readonly reason?: string | null;
}

export interface GetModerationStatusDto {
  readonly target: ModerationTargetValue;
  readonly targetId: string;
}

export interface GetModerationRequestDto {
  readonly requestId?: string;
  readonly target?: ModerationTargetValue;
  readonly targetId?: string;
}
