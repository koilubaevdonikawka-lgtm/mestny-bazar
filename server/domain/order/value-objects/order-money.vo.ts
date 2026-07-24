import { InvalidOrderMoneyError } from "@server/domain/order/exceptions/order.errors";
import type { OrderCurrency } from "@server/domain/order/value-objects/order-currency.vo";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface OrderMoneyJSON {
  amount: number;
  currency: string;
}

export class OrderMoney implements ValueObject<OrderMoney, OrderMoneyJSON> {
  private constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {}

  static create(amount: number, currency: OrderCurrency): OrderMoney {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new InvalidOrderMoneyError();
    }
    return new OrderMoney(Number(amount.toFixed(2)), currency.toString());
  }

  static zero(currency: OrderCurrency): OrderMoney {
    return OrderMoney.create(0, currency);
  }

  static from(json: OrderMoneyJSON): OrderMoney {
    return new OrderMoney(
      Number(json.amount.toFixed(2)),
      json.currency.trim().toUpperCase(),
    );
  }

  valueOf(): OrderMoneyJSON {
    return this.toJSON();
  }

  amountValue(): number {
    return this.amount;
  }

  currencyValue(): string {
    return this.currency;
  }

  add(other: OrderMoney): OrderMoney {
    this.assertSameCurrency(other);
    return OrderMoney.from({
      amount: this.amount + other.amount,
      currency: this.currency,
    });
  }

  subtract(other: OrderMoney): OrderMoney {
    this.assertSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new InvalidOrderMoneyError("Money subtraction would result in negative amount");
    }
    return OrderMoney.from({ amount: result, currency: this.currency });
  }

  multiply(factor: number): OrderMoney {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new InvalidOrderMoneyError();
    }
    return OrderMoney.from({
      amount: this.amount * factor,
      currency: this.currency,
    });
  }

  equals(other: OrderMoney): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toJSON(): OrderMoneyJSON {
    return Object.freeze({ amount: this.amount, currency: this.currency });
  }

  clone(): OrderMoney {
    return OrderMoney.from(this.toJSON());
  }

  private assertSameCurrency(other: OrderMoney): void {
    if (this.currency !== other.currency) {
      throw new InvalidOrderMoneyError("Currency mismatch");
    }
  }
}
