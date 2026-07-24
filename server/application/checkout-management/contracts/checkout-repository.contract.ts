import type { OrderDraft } from "@server/application/checkout-management/models/order-draft.model";

/** Persists Order Drafts — no product or payment data beyond draft lines. */
export interface ICheckoutRepository {
  save(draft: OrderDraft): Promise<void>;
  findById(checkoutId: string): Promise<OrderDraft | null>;
  findActiveDraftByCustomerId(customerId: string): Promise<OrderDraft | null>;
  update(draft: OrderDraft): Promise<void>;
  delete(checkoutId: string): Promise<boolean>;
}
