import type { ProfileDTO, UpdateProfileRequest } from "@shared/contracts/user";
import type { IProfileRepository } from "@server/ports/profile.repository";
import { ProfileNotFoundError, ProfileValidationError } from "@server/domain/profile.errors";

/**
 * Задача №182 — first real service for the customer profile (name/phone).
 * ProfileDTO.fullName stays a single combined field, not split into
 * firstName/lastName: nothing downstream (OrderDTO.customerName, admin/
 * courier order views, invoices) ever needs the two halves separately, and
 * Google OAuth (the only sign-in method this app has) already supplies one
 * combined string — splitting it would mean parsing that string into two
 * parts for every existing user, an unreliable operation for names that
 * don't cleanly split into exactly two tokens, for zero real benefit.
 */
export class ProfileService {
  constructor(private readonly profiles: IProfileRepository) {}

  async getById(userId: string): Promise<ProfileDTO> {
    const profile = await this.profiles.getById(userId);
    if (!profile) throw new ProfileNotFoundError();
    return profile;
  }

  async update(userId: string, data: UpdateProfileRequest): Promise<ProfileDTO> {
    if (data.fullName !== undefined) {
      this.validateFullName(data.fullName);
    }
    if (data.phone !== undefined) {
      this.validatePhone(data.phone);
    }
    return this.profiles.update(userId, data);
  }

  private validateFullName(fullName: string): void {
    if (!fullName?.trim() || fullName.trim().length < 2) {
      throw new ProfileValidationError("Name must be at least 2 characters", "fullName");
    }
  }

  private validatePhone(phone: string): void {
    const digits = phone.replace(/[^\d]/g, "");
    if (digits.length < 9) {
      throw new ProfileValidationError("Phone must contain at least 9 digits", "phone");
    }
  }
}
