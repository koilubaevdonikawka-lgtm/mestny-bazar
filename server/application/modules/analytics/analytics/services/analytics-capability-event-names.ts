/** Normalized capability event names consumed by Analytics projections. */
export const AnalyticsCapabilityEventName = {
  OrderCreated: "order.created",
  OrderStatusChanged: "order.status_changed",
  PaymentSucceeded: "payment.succeeded",
  PaymentCreated: "payment.created",
  CustomerCreated: "customer.created",
  SellerCreated: "seller.created",
  SellerApproved: "seller.approved",
  SellerSuspended: "seller.suspended",
  ProductCreated: "product.created",
  ProductReadyForPublication: "product.ready_for_publication",
  ListingPublished: "marketplace.listing.published",
  ListingUnpublished: "marketplace.listing.unpublished",
  InventoryAdjusted: "inventory.adjusted",
  PriceCreated: "pricing.price_created",
  TicketCreated: "support.ticket.created",
  ComplaintCreated: "support.complaint.created",
  ModerationRequested: "moderation.requested",
  ModerationApproved: "moderation.approved",
} as const;

export type AnalyticsCapabilityEventNameValue =
  (typeof AnalyticsCapabilityEventName)[keyof typeof AnalyticsCapabilityEventName];

export const ANALYTICS_CAPABILITY_EVENT_NAMES: readonly AnalyticsCapabilityEventNameValue[] =
  Object.values(AnalyticsCapabilityEventName);
