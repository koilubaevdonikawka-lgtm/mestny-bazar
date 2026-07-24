import { InvalidOrderCommentError } from "@server/domain/order/exceptions/order.errors";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

const MAX_LENGTH = 1000;

export interface OrderCommentJSON {
  value: string | null;
}

export class OrderComment implements ValueObject<OrderComment, OrderCommentJSON> {
  private constructor(private readonly value: string | null) {}

  static create(raw: string | null | undefined): OrderComment {
    if (raw === null || raw === undefined) {
      return new OrderComment(null);
    }

    const value = raw.trim();
    if (value.length > MAX_LENGTH) {
      throw new InvalidOrderCommentError();
    }

    return new OrderComment(value.length > 0 ? value : null);
  }

  static empty(): OrderComment {
    return new OrderComment(null);
  }

  static from(json: OrderCommentJSON): OrderComment {
    return OrderComment.create(json.value);
  }

  valueOf(): string | null {
    return this.value;
  }

  equals(other: OrderComment): boolean {
    return this.value === other.value;
  }

  toJSON(): OrderCommentJSON {
    return Object.freeze({ value: this.value });
  }

  clone(): OrderComment {
    return OrderComment.from(this.toJSON());
  }

  toString(): string | null {
    return this.value;
  }
}
