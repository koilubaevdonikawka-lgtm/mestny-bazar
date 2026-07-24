import type { IPhoneVerificationRepository } from "@server/application/customer-management/contracts/phone-verification-repository.contract";

/** In-memory phone verification repository for development and tests. */
export class MemoryPhoneVerificationRepository implements IPhoneVerificationRepository {
  private readonly codes = new Map<string, string>();

  async saveCode(customerId: string, code: string): Promise<void> {
    this.codes.set(customerId.trim(), code.trim());
  }

  async verify(customerId: string, code: string): Promise<boolean> {
    return this.codes.get(customerId.trim()) === code.trim();
  }

  async delete(customerId: string): Promise<void> {
    this.codes.delete(customerId.trim());
  }
}

/** @deprecated Use MemoryPhoneVerificationRepository — kept for backward compatibility. */
export class MemoryPhoneVerificationStore extends MemoryPhoneVerificationRepository {}
