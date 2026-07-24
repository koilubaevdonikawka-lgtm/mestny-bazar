import type { IModerationStore } from "@server/application/modules/moderation/moderation/contracts";
import type {
  ApproveModerationDto,
  CancelModerationDto,
  CreateModerationRequestDto,
  GetModerationRequestDto,
  GetModerationStatusDto,
  RejectModerationDto,
} from "@server/application/modules/moderation/moderation/dto";
import {
  createModerationApprovedEvent,
  createModerationCancelledEvent,
  createModerationRejectedEvent,
  createModerationRequestedEvent,
} from "@server/application/modules/moderation/moderation/events";
import {
  createModerationRequest,
  isModerationTarget,
  ModerationStatus,
  ModerationTarget,
  moderationReasonFromMessage,
  withModerationApproved,
  withModerationCancelled,
  withModerationRejected,
  type ModerationRequest,
  type ModerationStatusValue,
} from "@server/application/modules/moderation/moderation/models";
import { AutoModerationPolicy } from "@server/application/modules/moderation/moderation/policies/auto-moderation.policy";
import { ModerationPolicy } from "@server/application/modules/moderation/moderation/policies/moderation.policy";
import type { SupportModule } from "@server/application/modules/support/support/api/support.module";
import type { IIdGenerator } from "@server/application/ports";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";

/** Moderation business capability service — orchestrates requests via IModerationStore. */
export class ModerationService {
  private readonly policy = new ModerationPolicy();
  private readonly autoModerationPolicy = new AutoModerationPolicy();

  constructor(
    private readonly store: IModerationStore,
    private readonly idGenerator: IIdGenerator,
    private readonly provider: ServiceProvider,
  ) {}

  async requestModeration(dto: CreateModerationRequestDto): Promise<ModerationRequest> {
    validateCreateModerationRequestDto(dto);
    await this.assertComplaintTargetExists(dto);

    const existing = await this.store.findLatestRequestByTarget(dto.target, dto.targetId.trim());
    if (existing && existing.status === ModerationStatus.Pending) {
      return existing;
    }

    const request = createModerationRequest({
      id: this.idGenerator.generate(),
      target: dto.target,
      targetId: dto.targetId,
      requestedBy: dto.requestedBy,
    });

    await this.store.saveRequest(request);
    createModerationRequestedEvent(request);

    if (this.autoModerationPolicy.shouldAutoApprove(request)) {
      return this.approve({
        requestId: request.id,
      });
    }

    return request;
  }

  async approve(dto: ApproveModerationDto): Promise<ModerationRequest> {
    const request = await this.requireRequest(dto);
    if (!this.policy.canApprove(request)) {
      throw new Error(`Moderation request ${request.id} cannot be approved.`);
    }

    const approved = withModerationApproved(request);
    await this.store.updateRequest(approved);
    createModerationApprovedEvent(approved);

    return approved;
  }

  async reject(dto: RejectModerationDto): Promise<ModerationRequest> {
    validateRejectModerationDto(dto);

    const request = await this.requireRequest(dto);
    if (!this.policy.canReject(request)) {
      throw new Error(`Moderation request ${request.id} cannot be rejected.`);
    }

    const rejected = withModerationRejected(
      request,
      moderationReasonFromMessage(dto.reason),
    );
    await this.store.updateRequest(rejected);
    createModerationRejectedEvent(rejected);

    return rejected;
  }

  async cancel(dto: CancelModerationDto): Promise<ModerationRequest> {
    const request = await this.requireRequest(dto);
    if (!this.policy.canCancel(request)) {
      throw new Error(`Moderation request ${request.id} cannot be cancelled.`);
    }

    const reason = dto.reason?.trim()
      ? moderationReasonFromMessage(dto.reason)
      : null;
    const cancelled = withModerationCancelled(request, reason);
    await this.store.updateRequest(cancelled);
    createModerationCancelledEvent(cancelled);

    return cancelled;
  }

  async getRequest(dto: GetModerationRequestDto): Promise<ModerationRequest | null> {
    if (dto.requestId?.trim()) {
      return this.store.findRequestById(dto.requestId.trim());
    }

    if (dto.target && dto.targetId?.trim()) {
      return this.store.findLatestRequestByTarget(dto.target, dto.targetId.trim());
    }

    throw new Error("Moderation request id or target reference is required.");
  }

  async getStatus(dto: GetModerationStatusDto): Promise<ModerationStatusValue> {
    validateGetModerationStatusDto(dto);

    const request = await this.store.findLatestRequestByTarget(
      dto.target,
      dto.targetId.trim(),
    );
    return request?.status ?? ModerationStatus.Pending;
  }

  private async requireRequest(
    dto: ApproveModerationDto | RejectModerationDto | CancelModerationDto,
  ): Promise<ModerationRequest> {
    if (dto.requestId?.trim()) {
      const request = await this.store.findRequestById(dto.requestId.trim());
      if (!request) {
        throw new Error(`Moderation request not found: ${dto.requestId}`);
      }
      return request;
    }

    if (dto.target && dto.targetId?.trim()) {
      const request = await this.store.findLatestRequestByTarget(dto.target, dto.targetId.trim());
      if (!request) {
        throw new Error(
          `Moderation request not found for ${dto.target} ${dto.targetId}.`,
        );
      }
      return request;
    }

    throw new Error("Moderation request id or target reference is required.");
  }

  private async assertComplaintTargetExists(dto: CreateModerationRequestDto): Promise<void> {
    if (dto.target !== ModerationTarget.Complaint) {
      return;
    }

    const support = this.provider.resolve<SupportModule>(BootstrapTokens.SupportModule);
    const ticket = await support.getTicket(dto.targetId.trim());
    if (!ticket) {
      throw new Error(`Support complaint not found: ${dto.targetId}`);
    }
  }
}

function validateCreateModerationRequestDto(dto: CreateModerationRequestDto): void {
  if (!isModerationTarget(dto.target)) {
    throw new Error(`Unknown moderation target: ${dto.target}`);
  }
  if (!dto.targetId?.trim()) {
    throw new Error("Moderation target id is required.");
  }
}

function validateRejectModerationDto(dto: RejectModerationDto): void {
  if (!dto.reason?.trim()) {
    throw new Error("Moderation rejection reason is required.");
  }
}

function validateGetModerationStatusDto(dto: GetModerationStatusDto): void {
  if (!isModerationTarget(dto.target)) {
    throw new Error(`Unknown moderation target: ${dto.target}`);
  }
  if (!dto.targetId?.trim()) {
    throw new Error("Moderation target id is required.");
  }
}
