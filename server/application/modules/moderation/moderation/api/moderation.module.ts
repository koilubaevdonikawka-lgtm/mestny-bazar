import type {
  ApproveModerationDto,
  CancelModerationDto,
  CreateModerationRequestDto,
  GetModerationRequestDto,
  GetModerationStatusDto,
  RejectModerationDto,
} from "@server/application/modules/moderation/moderation/dto";
import type {
  ModerationRequest,
  ModerationStatusValue,
} from "@server/application/modules/moderation/moderation/models";
import type { ModerationService } from "@server/application/modules/moderation/moderation/services";

/** Public entry point for the Moderation business capability module. */
export class ModerationModule {
  constructor(private readonly service: ModerationService) {}

  requestModeration(dto: CreateModerationRequestDto): Promise<ModerationRequest> {
    return this.service.requestModeration(dto);
  }

  approve(dto: ApproveModerationDto): Promise<ModerationRequest> {
    return this.service.approve(dto);
  }

  reject(dto: RejectModerationDto): Promise<ModerationRequest> {
    return this.service.reject(dto);
  }

  cancel(dto: CancelModerationDto): Promise<ModerationRequest> {
    return this.service.cancel(dto);
  }

  getRequest(dto: GetModerationRequestDto): Promise<ModerationRequest | null> {
    return this.service.getRequest(dto);
  }

  getStatus(dto: GetModerationStatusDto): Promise<ModerationStatusValue> {
    return this.service.getStatus(dto);
  }
}
