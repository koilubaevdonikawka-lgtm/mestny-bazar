import type { ICheckoutRepository } from "@server/application/checkout-management/contracts/checkout-repository.contract";
import {
  CheckoutStatus,
  type OrderDraft,
} from "@server/application/checkout-management/models/order-draft.model";

/** In-memory Order Draft store. */
export class CheckoutRepository implements ICheckoutRepository {
  private readonly drafts = new Map<string, OrderDraft>();

  async save(draft: OrderDraft): Promise<void> {
    this.drafts.set(draft.checkoutId, draft);
  }

  async findById(checkoutId: string): Promise<OrderDraft | null> {
    return this.drafts.get(checkoutId.trim()) ?? null;
  }

  async findActiveDraftByCustomerId(customerId: string): Promise<OrderDraft | null> {
    for (const draft of this.drafts.values()) {
      if (draft.customerId === customerId.trim() && draft.status === CheckoutStatus.Draft) {
        return draft;
      }
    }
    return null;
  }

  async update(draft: OrderDraft): Promise<void> {
    if (!(await this.findById(draft.checkoutId))) {
      throw new Error(`Checkout draft not found: ${draft.checkoutId}`);
    }
    this.drafts.set(draft.checkoutId, draft);
  }

  async delete(checkoutId: string): Promise<boolean> {
    return this.drafts.delete(checkoutId.trim());
  }
}
