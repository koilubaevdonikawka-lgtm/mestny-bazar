import { InvalidSellerVerificationError } from "@server/domain/seller/exceptions/seller.errors";
import type { ValueObject } from "@server/domain/seller/value-objects/value-object.types";

export type SellerVerificationLevel = "none" | "pending" | "verified" | "rejected";

export interface SellerVerificationJSON {
  level: SellerVerificationLevel;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
}

export class SellerVerification implements ValueObject<SellerVerification, SellerVerificationJSON> {
  private constructor(
    private readonly level: SellerVerificationLevel,
    private readonly submittedAt: string | null,
    private readonly verifiedAt: string | null,
    private readonly rejectionReason: string | null,
  ) {}

  static initial(): SellerVerification {
    return new SellerVerification("none", null, null, null);
  }

  static pending(submittedAt: string): SellerVerification {
    return new SellerVerification("pending", submittedAt, null, null);
  }

  static verified(submittedAt: string | null, verifiedAt: string): SellerVerification {
    return new SellerVerification("verified", submittedAt, verifiedAt, null);
  }

  static rejected(submittedAt: string | null, reason: string): SellerVerification {
    const normalizedReason = reason?.trim();
    if (!normalizedReason) {
      throw new InvalidSellerVerificationError("Rejection reason is required");
    }
    return new SellerVerification("rejected", submittedAt, null, normalizedReason);
  }

  static from(json: SellerVerificationJSON): SellerVerification {
    switch (json.level) {
      case "none":
        return SellerVerification.initial();
      case "pending":
        if (!json.submittedAt) {
          throw new InvalidSellerVerificationError("Pending verification requires submittedAt");
        }
        return SellerVerification.pending(json.submittedAt);
      case "verified":
        if (!json.verifiedAt) {
          throw new InvalidSellerVerificationError("Verified state requires verifiedAt");
        }
        return SellerVerification.verified(json.submittedAt, json.verifiedAt);
      case "rejected":
        return SellerVerification.rejected(json.submittedAt, json.rejectionReason ?? "");
      default:
        throw new InvalidSellerVerificationError();
    }
  }

  valueOf(): SellerVerificationJSON {
    return this.toJSON();
  }

  levelValue(): SellerVerificationLevel {
    return this.level;
  }

  isVerified(): boolean {
    return this.level === "verified";
  }

  isPending(): boolean {
    return this.level === "pending";
  }

  equals(other: SellerVerification): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  toJSON(): SellerVerificationJSON {
    return Object.freeze({
      level: this.level,
      submittedAt: this.submittedAt,
      verifiedAt: this.verifiedAt,
      rejectionReason: this.rejectionReason,
    });
  }

  clone(): SellerVerification {
    return SellerVerification.from(this.toJSON());
  }
}
