import type { ModerationRequest } from "@server/application/modules/moderation/moderation/models";
import type { ModerationTargetValue } from "@server/application/modules/moderation/moderation/models/moderation-target.model";

/** Moderation request persistence contract — implemented by infrastructure adapters. */
export interface IModerationStore {
  saveRequest(request: ModerationRequest): Promise<void>;
  updateRequest(request: ModerationRequest): Promise<void>;
  findRequestById(requestId: string): Promise<ModerationRequest | null>;
  findLatestRequestByTarget(
    target: ModerationTargetValue,
    targetId: string,
  ): Promise<ModerationRequest | null>;
}
