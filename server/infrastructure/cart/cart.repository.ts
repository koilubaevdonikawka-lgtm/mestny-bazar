import type { ICartRepository } from "@server/application/cart-management/contracts/cart-repository.contract";
import {
  createCartLine,
  type CartLine,
} from "@server/application/cart-management/models/cart-line.model";

/** In-memory cart line store — Customer ↔ Product ↔ Quantity only. */
export class CartRepository implements ICartRepository {
  private readonly linesByCustomer = new Map<string, Map<string, CartLine>>();

  async findByCustomerId(customerId: string): Promise<readonly CartLine[]> {
    const customerLines = this.linesByCustomer.get(customerId.trim());
    if (!customerLines) {
      return Object.freeze([]);
    }
    return Object.freeze([...customerLines.values()]);
  }

  async addItem(customerId: string, productId: string, quantity: number): Promise<CartLine> {
    const normalizedCustomerId = customerId.trim();
    const normalizedProductId = productId.trim();
    const customerLines = this.linesByCustomer.get(normalizedCustomerId) ?? new Map();
    const existing = customerLines.get(normalizedProductId);
    const line = createCartLine(
      normalizedCustomerId,
      normalizedProductId,
      (existing?.quantity ?? 0) + quantity,
    );
    customerLines.set(normalizedProductId, line);
    this.linesByCustomer.set(normalizedCustomerId, customerLines);
    return line;
  }

  async updateQuantity(
    customerId: string,
    productId: string,
    quantity: number,
  ): Promise<CartLine | null> {
    const normalizedCustomerId = customerId.trim();
    const normalizedProductId = productId.trim();
    const customerLines = this.linesByCustomer.get(normalizedCustomerId);
    if (!customerLines) {
      return null;
    }

    if (quantity <= 0) {
      customerLines.delete(normalizedProductId);
      return null;
    }

    const line = createCartLine(normalizedCustomerId, normalizedProductId, quantity);
    customerLines.set(normalizedProductId, line);
    return line;
  }

  async removeItem(customerId: string, productId: string): Promise<boolean> {
    const customerLines = this.linesByCustomer.get(customerId.trim());
    if (!customerLines) {
      return false;
    }
    return customerLines.delete(productId.trim());
  }

  async clear(customerId: string): Promise<number> {
    const normalizedCustomerId = customerId.trim();
    const customerLines = this.linesByCustomer.get(normalizedCustomerId);
    if (!customerLines) {
      return 0;
    }
    const removed = customerLines.size;
    this.linesByCustomer.delete(normalizedCustomerId);
    return removed;
  }
}
