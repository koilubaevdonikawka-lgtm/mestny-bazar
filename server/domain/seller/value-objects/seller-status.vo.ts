import { InvalidSellerStatusError } from "@server/domain/seller/exceptions/seller.errors";
import {
  SELLER_LIFECYCLE_STATUS_VALUES,
  type SellerLifecycleStatus,
  isSellerLifecycleStatus,
} from "@server/domain/seller/status/seller-status";
import type { ValueObject } from "@server/domain/seller/value-objects/value-object.types";

export interface SellerStatusJSON {
  value: SellerLifecycleStatus;
}

/** Validated seller lifecycle status value object. */
export class SellerStatus implements ValueObject<SellerStatus, SellerStatusJSON> {
  private constructor(private readonly value: SellerLifecycleStatus) {}

  static create(raw: string): SellerStatus {
    if (!isSellerLifecycleStatus(raw)) {
      throw new InvalidSellerStatusError(`Invalid seller status: ${raw}`);
    }
    return new SellerStatus(raw);
  }

  static from(json: SellerStatusJSON): SellerStatus {
    return SellerStatus.create(json.value);
  }

  static registered(): SellerStatus {
    return SellerStatus.create("Registered");
  }

  valueOf(): SellerLifecycleStatus {
    return this.value;
  }

  equals(other: SellerStatus): boolean {
    return this.value === other.value;
  }

  toJSON(): SellerStatusJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): SellerStatus {
    return SellerStatus.from(this.toJSON());
  }

  toString(): SellerLifecycleStatus {
    return this.value;
  }

  static allowedValues(): readonly SellerLifecycleStatus[] {
    return SELLER_LIFECYCLE_STATUS_VALUES;
  }
}
