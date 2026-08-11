import type { ICourierProfileRepository } from "@server/ports/courier-profile.repository";
import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type {
  BulkSetCourierProfileStatusRequest,
  CourierProfileDTO,
  CreateCourierProfileRequest,
  UpdateCourierProfileRequest,
} from "@shared/contracts/courier-profile";
import { CourierProfileStatus } from "@shared/contracts/courier-profile";
import {
  CourierProfileAlreadyExistsError,
  CourierProfileNotFoundError,
  CourierProfileValidationError,
} from "@server/domain/courier-profile.errors";

/**
 * Courier creation is "search an existing registered user, then create a
 * profile + assign the role in one action" (Промпт №068 scope decision) —
 * no new invite/auth mechanism, since this platform is Google-OAuth-only.
 */
export class CourierProfileService {
  constructor(
    private readonly profiles: ICourierProfileRepository,
    private readonly userAdmin: IUserAdminRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listProfiles(): Promise<CourierProfileDTO[]> {
    return this.profiles.list();
  }

  async getProfile(userId: string): Promise<CourierProfileDTO> {
    const profile = await this.profiles.getByUserId(userId);
    if (!profile) throw new CourierProfileNotFoundError();
    return profile;
  }

  async createCourier(
    data: CreateCourierProfileRequest,
    actorId: string,
  ): Promise<CourierProfileDTO> {
    this.validateNames(data.lastName, data.firstName);
    this.validatePhone(data.phone);

    const user = await this.userAdmin.getById(data.userId);
    if (!user) {
      throw new CourierProfileValidationError("User not found", "userId");
    }

    const existing = await this.profiles.getByUserId(data.userId);
    if (existing) {
      throw new CourierProfileAlreadyExistsError();
    }

    await this.userAdmin.assignRole(data.userId, "courier");
    const profile = await this.profiles.create({ ...data, createdBy: actorId });
    await this.events.publish({ type: "courier.created", userId: data.userId });
    return profile;
  }

  async updateProfile(data: UpdateCourierProfileRequest): Promise<CourierProfileDTO> {
    if (data.lastName !== undefined || data.firstName !== undefined) {
      const existing = await this.getProfile(data.userId);
      this.validateNames(data.lastName ?? existing.lastName, data.firstName ?? existing.firstName);
    }
    if (data.phone !== undefined) {
      this.validatePhone(data.phone);
    }
    return this.profiles.update(data);
  }

  async blockCourier(userId: string): Promise<CourierProfileDTO> {
    const profile = await this.profiles.setStatus(userId, CourierProfileStatus.BLOCKED);
    await this.events.publish({ type: "courier.blocked", userId });
    return profile;
  }

  async unblockCourier(userId: string): Promise<CourierProfileDTO> {
    const profile = await this.profiles.setStatus(userId, CourierProfileStatus.ACTIVE);
    await this.events.publish({ type: "courier.unblocked", userId });
    return profile;
  }

  async bulkSetStatus(data: BulkSetCourierProfileStatusRequest): Promise<void> {
    await this.profiles.bulkSetStatus(data.userIds, data.status);
    const eventType =
      data.status === CourierProfileStatus.BLOCKED ? "courier.blocked" : "courier.unblocked";
    for (const userId of data.userIds) {
      await this.events.publish({ type: eventType, userId });
    }
  }

  private validateNames(lastName: string, firstName: string): void {
    if (!lastName?.trim()) {
      throw new CourierProfileValidationError("Last name is required", "lastName");
    }
    if (!firstName?.trim()) {
      throw new CourierProfileValidationError("First name is required", "firstName");
    }
  }

  private validatePhone(phone: string): void {
    if (!phone?.trim() || phone.trim().length < 5) {
      throw new CourierProfileValidationError("Phone must be at least 5 characters", "phone");
    }
  }
}
