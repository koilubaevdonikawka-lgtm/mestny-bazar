/** Domain-level order lifecycle status. Mapped to DB enum in Supabase adapter. */
export const OrderStatus = {
  CREATED: "CREATED",
  PAID: "PAID",
  CONFIRMED: "CONFIRMED",
  ASSEMBLING: "ASSEMBLING",
  READY_FOR_DELIVERY: "READY_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  ARRIVED: "ARRIVED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export type PaymentStatus = "unpaid" | "awaiting" | "paid" | "failed" | "refunded";

export type PaymentMethod = "ONLINE" | "CASH";

export interface OrderItemDTO {
  id: string;
  productId: string | null;
  /** Stage 17 — which product_variants row this line was ordered as, if any. Not yet validated/resolved anywhere (no variant-aware pricing/stock check exists yet); a plain persisted identifier for a future stage to build on. */
  variantId: string | null;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  /** Snapshotted at checkout (docs/delivery/) — Courier Platform reads these without re-deriving. */
  zoneId: string | null;
  deliveryTariffId: string | null;
  deliveryEtaMinMinutes: number | null;
  deliveryEtaMaxMinutes: number | null;
  discountAmount: number;
  couponCode: string | null;
  total: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  addressSnapshot: string;
  /**
   * Задача №151 — set only when the customer used the "Определить моё
   * местоположение" button (browser Geolocation API) at checkout; null for
   * a plain manually-typed address. Lets courier navigation (RouteMenuButton)
   * route to the exact point instead of a text search, which matters most
   * for villages/rural addresses poorly indexed by map providers.
   */
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  notes: string | null;
  paymentUrl: string | null;
  items: OrderItemDTO[];
  createdAt: string;
  paidAt: string | null;
  /** Persistent courier assignment (couriers.md §"Обнаруженный пробел") — null until auto-assigned. */
  assignedCourierId: string | null;
}

export interface CreateOrderItemRequest {
  quantity: number;
  /** Platform product UUID. */
  productId?: string;
  /** Product's platform slug. */
  productSlug?: string;
  /**
   * Stage 17 — optional product_variants UUID. Persisted as-is on the order
   * line (order_items.variant_id) once the item resolves; not validated
   * against the resolved product or checked for stock here — no variant-
   * aware pricing/reservation exists yet (a future stage's job, using the
   * already-built ProductVariantService/VariantStockService).
   */
  variantId?: string;
  /** Used to provision a platform product when slug is not in DB yet. */
  snapshot?: {
    name: string;
    price: number;
    currency?: string;
    imageUrl?: string | null;
  };
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  addressId?: string;
  addressSnapshot?: string;
  /** Задача №151 — captured together, only when the customer used the geolocation button; never sent independently of each other. */
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  zoneId?: string;
  /**
   * Задача №182 — no longer collected in the cart UI; when omitted, the
   * server resolves both from the authenticated user's saved Profile
   * (CD-01 — never trust a client-echoed value for something the account
   * already has on file). Required only for a guest/legacy caller that
   * supplies them explicitly.
   */
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  idempotencyKey: string;
  /** marketing.md — validated and applied server-side by DiscountPolicyService; never trusted as-is. */
  couponCode?: string;
}

export interface CreateOrderResponse {
  order: OrderDTO;
  paymentUrl: string | null;
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
}

export interface OrderListResult {
  items: OrderDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
