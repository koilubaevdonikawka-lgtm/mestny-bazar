import type { OrderDTO } from "@shared/contracts/order";

type DbOrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "preparing"
  | "ready_for_delivery"
  | "delivering"
  | "arrived"
  | "delivered"
  | "cancelled";

// One DB value per domain status — see the 20260725020000 migration. Previously
// CONFIRMED/READY_FOR_DELIVERY/ARRIVED collapsed onto PAID/ASSEMBLING/OUT_FOR_DELIVERY
// respectively (the enum only had 6 values), so those three states silently reverted
// to their predecessor on every re-read from the database.
const DOMAIN_TO_DB_STATUS: Record<OrderDTO["status"], DbOrderStatus> = {
  CREATED: "pending",
  PAID: "paid",
  CONFIRMED: "confirmed",
  ASSEMBLING: "preparing",
  READY_FOR_DELIVERY: "ready_for_delivery",
  OUT_FOR_DELIVERY: "delivering",
  ARRIVED: "arrived",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const DB_TO_DOMAIN_STATUS: Record<DbOrderStatus, OrderDTO["status"]> = {
  pending: "CREATED",
  paid: "PAID",
  confirmed: "CONFIRMED",
  preparing: "ASSEMBLING",
  ready_for_delivery: "READY_FOR_DELIVERY",
  delivering: "OUT_FOR_DELIVERY",
  arrived: "ARRIVED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

export function toDbOrderStatus(status: OrderDTO["status"]): DbOrderStatus {
  return DOMAIN_TO_DB_STATUS[status];
}

export function fromDbOrderStatus(status: DbOrderStatus): OrderDTO["status"] {
  return DB_TO_DOMAIN_STATUS[status];
}

interface DbOrderRow {
  id: string;
  order_number: number;
  status: DbOrderStatus;
  payment_status: OrderDTO["paymentStatus"];
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  coupon_code: string | null;
  total: number;
  currency: string;
  customer_name: string;
  customer_phone: string;
  address_snapshot: string;
  notes: string | null;
  finik_payment_url: string | null;
  paid_at: string | null;
  created_at: string;
  assigned_courier_id: string | null;
  zone_id: string | null;
  delivery_tariff_id: string | null;
  delivery_eta_min_minutes: number | null;
  delivery_eta_max_minutes: number | null;
}

interface DbOrderItemRow {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export function mapOrderRowToDto(
  row: DbOrderRow,
  items: DbOrderItemRow[],
  paymentMethod: OrderDTO["paymentMethod"],
): OrderDTO {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: fromDbOrderStatus(row.status),
    paymentStatus: row.payment_status,
    paymentMethod,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    discountAmount: Number(row.discount_amount),
    couponCode: row.coupon_code,
    total: Number(row.total),
    currency: row.currency,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    addressSnapshot: row.address_snapshot,
    notes: row.notes,
    paymentUrl: row.finik_payment_url,
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      productName: item.product_name,
      productImageUrl: item.product_image_url,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
    })),
    createdAt: row.created_at,
    paidAt: row.paid_at,
    assignedCourierId: row.assigned_courier_id,
    zoneId: row.zone_id,
    deliveryTariffId: row.delivery_tariff_id,
    deliveryEtaMinMinutes: row.delivery_eta_min_minutes,
    deliveryEtaMaxMinutes: row.delivery_eta_max_minutes,
  };
}
