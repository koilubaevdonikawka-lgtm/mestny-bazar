import type { ICartStore } from "@server/application/modules/cart/cart/contracts";
import type { AddCartItemDto } from "@server/application/modules/cart/cart/dto";
import {
  type CartItem,
  cartItemSubtotal,
  createCartItem,
} from "@server/application/modules/cart/cart/models";
import {
  type CartSnapshot,
  createCartSnapshot,
  emptyCartSnapshot,
} from "@server/application/modules/cart/cart/models";
import type { IProductRepository } from "@server/application/ports";

/** Cart business capability service — orchestrates cart operations via ICartStore. */
export class CartService {
  constructor(
    private readonly store: ICartStore,
    private readonly products?: IProductRepository,
  ) {}

  async addItem(input: AddCartItemDto): Promise<CartSnapshot> {
    const product = await this.products?.findSnapshotById(input.productId);
    if (this.products && !product) {
      throw new Error(`Product not found: ${input.productId}`);
    }

    const item = createCartItem({
      productId: input.productId,
      sellerId: product?.sellerId ?? "unknown-seller",
      catalogId: input.catalogId ?? product?.attributes["categoryId"] ?? "default-catalog",
      name: product?.name ?? input.productId,
      priceAmount: product?.priceAmount ?? 0,
      currency: product?.priceCurrency ?? "KGS",
      quantity: input.quantity,
    });

    const items = [...(await this.loadItems(input.customerId))];
    const existingIndex = items.findIndex((entry) => entry.productId === item.productId);
    if (existingIndex >= 0) {
      items[existingIndex] = createCartItem({
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + item.quantity,
      });
    } else {
      items.push(item);
    }

    return this.persist(input.customerId, items, item.currency);
  }

  async removeItem(customerId: string, productId: string): Promise<CartSnapshot> {
    const items = (await this.loadItems(customerId)).filter((item) => item.productId !== productId);
    return this.persist(customerId, items);
  }

  async changeQuantity(
    customerId: string,
    productId: string,
    quantity: number,
  ): Promise<CartSnapshot> {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Quantity must be a positive integer.");
    }

    const items = (await this.loadItems(customerId)).map((item) =>
      item.productId === productId ? createCartItem({ ...item, quantity }) : item,
    );

    if (!items.some((item) => item.productId === productId)) {
      throw new Error(`Cart item not found: ${productId}`);
    }

    return this.persist(customerId, items);
  }

  async clearCart(customerId: string): Promise<CartSnapshot> {
    const snapshot = emptyCartSnapshot(customerId);
    await this.store.saveCart(snapshot);
    return snapshot;
  }

  async getCart(customerId: string): Promise<CartSnapshot> {
    const existing = await this.store.loadCart(customerId);
    if (existing) {
      return existing;
    }

    return emptyCartSnapshot(customerId);
  }

  calculateTotals(items: readonly CartItem[], currency = "KGS"): CartSnapshot["totals"] {
    const subtotal = Number(items.reduce((sum, item) => sum + cartItemSubtotal(item), 0).toFixed(2));
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return Object.freeze({ subtotal, itemCount, currency });
  }

  private async loadItems(customerId: string): Promise<CartItem[]> {
    const snapshot = await this.store.loadCart(customerId);
    return snapshot ? [...snapshot.items] : [];
  }

  private async persist(
    customerId: string,
    items: readonly CartItem[],
    currency = "KGS",
  ): Promise<CartSnapshot> {
    const snapshot = this.buildSnapshot(customerId, items, currency);
    await this.store.saveCart(snapshot);
    return snapshot;
  }

  private buildSnapshot(
    customerId: string,
    items: readonly CartItem[],
    currency = "KGS",
  ): CartSnapshot {
    const resolvedCurrency = items[0]?.currency ?? currency;
    return createCartSnapshot(customerId, items, resolvedCurrency);
  }
}
