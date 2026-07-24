import type { OrderDTO } from "@shared/contracts/order";

type DbOrderStatus = "pending" | "paid" | "preparing" | "delivering" | "delivered" | "cancelled";

const DOMAIN_TO_DB_STATUS: Record<OrderDTO["status"], DbOrderStatus> = {
  CREATED: "pending",
  PAID: "paid",
  CONFIRMED: "paid",
  ASSEMBLING: "preparing",
  READY_FOR_DELIVERY: "preparing",
  OUT_FOR_DELIVERY: "delivering",
  ARRIVED: "delivering",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const DB_TO_DOMAIN_STATUS: Record<DbOrderStatus, OrderDTO["status"]> = {
  pending: "CREATED",
  paid: "PAID",
  preparing: "ASSEMBLING",
  delivering: "OUT_FOR_DELIVERY",
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
  total: number;
  currency: string;
  customer_name: string;
  customer_phone: string;
  address_snapshot: string;
  notes: string | null;
  finik_payment_url: string | null;
  paid_at: string | null;
  created_at: string;
}

interface DbOrderItemRow {
  id: string;
  product_id: string | null;
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
      productName: item.product_name,
      productImageUrl: item.product_image_url,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
    })),
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}
