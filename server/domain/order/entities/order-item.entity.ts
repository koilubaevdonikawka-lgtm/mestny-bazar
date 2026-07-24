import { InvalidOrderItemError } from "@server/domain/order/exceptions/order.errors";
import {
  CatalogId,
  OrderMoney,
  OrderQuantity,
  ProductId,
  SellerId,
} from "@server/domain/order/value-objects";

export interface OrderItemProps {
  id: string;
  productId: string;
  sellerId: string;
  catalogId: string;
  name: string;
  priceAmount: number;
  currency: string;
  quantity: number;
}

export interface OrderItemJSON {
  id: string;
  productId: string;
  sellerId: string;
  catalogId: string;
  name: string;
  price: ReturnType<OrderMoney["toJSON"]>;
  quantity: number;
  subtotal: ReturnType<OrderMoney["toJSON"]>;
}

/** Order line item entity — belongs to Order aggregate. */
export class OrderItem {
  private constructor(
    private readonly id: string,
    private readonly productId: ProductId,
    private readonly sellerId: SellerId,
    private readonly catalogId: CatalogId,
    private readonly name: string,
    private readonly price: OrderMoney,
    private quantity: OrderQuantity,
    private subtotal: OrderMoney,
  ) {}

  static create(props: OrderItemProps): OrderItem {
    const id = props.id?.trim();
    const name = props.name?.trim();

    if (!id || !name) {
      throw new InvalidOrderItemError("Order item id and name are required");
    }

    const productId = ProductId.create(props.productId);
    const sellerId = SellerId.create(props.sellerId);
    const catalogId = CatalogId.create(props.catalogId);
    const price = OrderMoney.from({ amount: props.priceAmount, currency: props.currency });
    const quantity = OrderQuantity.create(props.quantity);
    const subtotal = price.multiply(quantity.quantityValue());

    return new OrderItem(id, productId, sellerId, catalogId, name, price, quantity, subtotal);
  }

  static fromJSON(json: OrderItemJSON): OrderItem {
    return OrderItem.create({
      id: json.id,
      productId: json.productId,
      sellerId: json.sellerId,
      catalogId: json.catalogId,
      name: json.name,
      priceAmount: json.price.amount,
      currency: json.price.currency,
      quantity: json.quantity,
    });
  }

  itemId(): string {
    return this.id;
  }

  changeQuantity(quantity: number): void {
    this.quantity = OrderQuantity.create(quantity);
    this.subtotal = this.price.multiply(this.quantity.quantityValue());
  }

  equals(other: OrderItem): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  clone(): OrderItem {
    return OrderItem.fromJSON(this.toJSON());
  }

  toJSON(): OrderItemJSON {
    return Object.freeze({
      id: this.id,
      productId: this.productId.toString(),
      sellerId: this.sellerId.toString(),
      catalogId: this.catalogId.toString(),
      name: this.name,
      price: this.price.toJSON(),
      quantity: this.quantity.quantityValue(),
      subtotal: this.subtotal.toJSON(),
    });
  }
}
