import { InvalidOrderTotalsError } from "@server/domain/order/exceptions/order.errors";
import { OrderCurrency } from "@server/domain/order/value-objects/order-currency.vo";
import { OrderMoney } from "@server/domain/order/value-objects/order-money.vo";
import type { ValueObject } from "@server/domain/order/value-objects/value-object.types";

export interface OrderTotalsJSON {
  subtotal: OrderMoney["toJSON"];
  deliveryFee: OrderMoney["toJSON"];
  discount: OrderMoney["toJSON"];
  total: OrderMoney["toJSON"];
}

export class OrderTotals implements ValueObject<OrderTotals, OrderTotalsJSON> {
  private constructor(
    private readonly subtotal: OrderMoney,
    private readonly deliveryFee: OrderMoney,
    private readonly discount: OrderMoney,
    private readonly total: OrderMoney,
  ) {}

  static calculate(input: {
    subtotal: OrderMoney;
    deliveryFee?: OrderMoney;
    discount?: OrderMoney;
  }): OrderTotals {
    const currency = OrderCurrency.create(input.subtotal.currencyValue());
    const deliveryFee = input.deliveryFee ?? OrderMoney.zero(currency);
    const discount = input.discount ?? OrderMoney.zero(currency);

    if (
      deliveryFee.currencyValue() !== currency.toString() ||
      discount.currencyValue() !== currency.toString()
    ) {
      throw new InvalidOrderTotalsError("All totals must share the same currency");
    }

    const gross = input.subtotal.add(deliveryFee);
    const total = gross.subtract(discount);

    return new OrderTotals(input.subtotal, deliveryFee, discount, total);
  }

  static empty(currency: OrderCurrency): OrderTotals {
    const zero = OrderMoney.zero(currency);
    return new OrderTotals(zero, zero.clone(), zero.clone(), zero.clone());
  }

  static from(json: OrderTotalsJSON): OrderTotals {
    return OrderTotals.calculate({
      subtotal: OrderMoney.from(json.subtotal),
      deliveryFee: OrderMoney.from(json.deliveryFee),
      discount: OrderMoney.from(json.discount),
    });
  }

  valueOf(): OrderTotalsJSON {
    return this.toJSON();
  }

  subtotalValue(): OrderMoney {
    return this.subtotal;
  }

  deliveryFeeValue(): OrderMoney {
    return this.deliveryFee;
  }

  discountValue(): OrderMoney {
    return this.discount;
  }

  totalValue(): OrderMoney {
    return this.total;
  }

  equals(other: OrderTotals): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  toJSON(): OrderTotalsJSON {
    return Object.freeze({
      subtotal: this.subtotal.toJSON(),
      deliveryFee: this.deliveryFee.toJSON(),
      discount: this.discount.toJSON(),
      total: this.total.toJSON(),
    });
  }

  clone(): OrderTotals {
    return OrderTotals.from(this.toJSON());
  }
}
