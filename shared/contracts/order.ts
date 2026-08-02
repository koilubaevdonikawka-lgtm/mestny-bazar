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
  zoneId?: string;
  customerName: string;
  customerPhone: string;
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
