import {
  ModerationStatus,
  type ModerationStatusValue,
} from "@server/application/modules/moderation/moderation/models/moderation-status.model";
import {
  ModerationDecision,
  type ModerationDecisionValue,
} from "@server/application/modules/moderation/moderation/models/moderation-decision.model";
import type { ModerationReason } from "@server/application/modules/moderation/moderation/models/moderation-reason.model";
import {
  ModerationTarget,
  type ModerationTargetValue,
} from "@server/application/modules/moderation/moderation/models/moderation-target.model";

/** Moderation request owned by the Moderation capability module. */
export interface ModerationRequest {
  readonly id: string;
  readonly target: ModerationTargetValue;
  readonly targetId: string;
  readonly status: ModerationStatusValue;
  readonly decision: ModerationDecisionValue | null;
  readonly reason: ModerationReason | null;
  readonly requestedBy: string | null;
  readonly decidedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createModerationRequest(input: {
  id: string;
  target: ModerationTargetValue;
  targetId: string;
  requestedBy?: string | null;
}): ModerationRequest {
  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    target: input.target,
    targetId: input.targetId.trim(),
    status: ModerationStatus.Pending,
    decision: null,
    reason: null,
    requestedBy: input.requestedBy?.trim() || null,
    decidedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withModerationRequestStatus(
  request: ModerationRequest,
  status: ModerationStatusValue,
  decision: ModerationDecisionValue | null,
  reason?: ModerationReason | null,
): ModerationRequest {
  const timestamp = new Date().toISOString();
  const isFinal =
    status === ModerationStatus.Approved ||
    status === ModerationStatus.Rejected ||
    status === ModerationStatus.Cancelled;

  return Object.freeze({
    ...request,
    status,
    decision,
    reason: reason === undefined ? request.reason : reason,
    decidedAt: isFinal ? timestamp : request.decidedAt,
    updatedAt: timestamp,
  });
}

export function withModerationApproved(request: ModerationRequest): ModerationRequest {
  return withModerationRequestStatus(
    request,
    ModerationStatus.Approved,
    ModerationDecision.Approved,
    null,
  );
}

export function withModerationRejected(
  request: ModerationRequest,
  reason: ModerationReason,
): ModerationRequest {
  return withModerationRequestStatus(
    request,
    ModerationStatus.Rejected,
    ModerationDecision.Rejected,
    reason,
  );
}

export function withModerationCancelled(
  request: ModerationRequest,
  reason: ModerationReason | null,
): ModerationRequest {
  return withModerationRequestStatus(
    request,
    ModerationStatus.Cancelled,
    ModerationDecision.Cancelled,
    reason,
  );
}

export function canModerationRequestBeDecided(request: ModerationRequest): boolean {
  return request.status === ModerationStatus.Pending;
}
