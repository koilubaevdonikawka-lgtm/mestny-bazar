import type {
  OrderDTO,
  OrderListParams,
  OrderListResult,
  OrderStatus,
  PaymentStatus,
} from "@shared/contracts/order";
import { OrderStatus as OrderStatusEnum } from "@shared/contracts/order";
import type { CreateOrderData, IOrderRepository } from "@server/ports/order.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { mapOrderRowToDto, toDbOrderStatus } from "@server/adapters/supabase/order.mapper";
import { isUuid } from "@server/domain/shared/uuid";
import { OrderConcurrentModificationError, OrderNotFoundError } from "@server/domain/orders.errors";

export function encodePaymentMethodNote(method: OrderDTO["paymentMethod"]): string {
  return `payment_method:${method}`;
}

// Anchored to the LAST line only, not a bare substring match: userNotes is
// client-controlled free text (see CheckoutService, which passes
// request.notes straight through), and mergeNotes always appends the real
// tag as the final line. A customer's own note text containing e.g. the
// literal string "payment_method:ONLINE" earlier in the field must not be
// able to spoof the decoded payment method on every later read (admin/
// courier/warehouse views) — a bare regex.match() over the whole string
// would return whichever occurrence comes first, not the real tag.
export function decodePaymentMethodNote(notes: string | null): OrderDTO["paymentMethod"] {
  if (!notes) return "CASH";
  const lastLine = notes.split("\n").pop() ?? "";
  const match = /^payment_method:(ONLINE|CASH)$/.exec(lastLine);
  return match?.[1] === "ONLINE" ? "ONLINE" : "CASH";
}

export function mergeNotes(
  userNotes: string | undefined,
  paymentMethod: OrderDTO["paymentMethod"],
): string | null {
  const methodTag = encodePaymentMethodNote(paymentMethod);
  if (!userNotes?.trim()) return methodTag;
  return `${userNotes.trim()}\n${methodTag}`;
}

const ORDER_COLUMNS =
  "id, order_number, status, payment_status, subtotal, delivery_fee, total, currency, customer_name, customer_phone, address_snapshot, notes, finik_payment_url, paid_at, created_at, assigned_courier_id";

/** Postgres unique_violation — see https://www.postgresql.org/docs/current/errcodes-appendix.html */
const UNIQUE_VIOLATION = "23505";

export class SupabaseOrderRepository implements IOrderRepository {
  async create(data: CreateOrderData): Promise<OrderDTO> {
    // CheckoutService already checks getOrderByIdempotencyKey up front; this second
    // check is the defense-in-depth layer for two requests racing concurrently past
    // that first check (see the unique_violation recovery below for the other half).
    const existing = await this.getByIdempotencyKey(data.idempotencyKey);
    if (existing) return existing;

    const paymentMethod = data.paymentMethod;
    const notes = mergeNotes(data.notes, paymentMethod);

    // Single RPC = single transaction: the order header and its line items are
    // created atomically, with no manual compensating DELETE if the second half
    // fails (the old two-INSERT version could leave an orphaned header-only
    // order if that compensating DELETE itself failed).
    const { data: newOrderId, error } = await supabaseAdmin.rpc("create_order_with_items", {
      order_data: {
        user_id: data.userId,
        idempotency_key: data.idempotencyKey,
        status: toDbOrderStatus(data.status),
        payment_status: data.paymentStatus,
        subtotal: data.subtotal,
        delivery_fee: data.deliveryFee,
        total: data.total,
        currency: data.currency,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        address_snapshot: data.addressSnapshot,
        zone_id: data.zoneId,
        notes,
      },
      items: data.items.map((item) => ({
        product_id: isUuid(item.productId) ? item.productId : null,
        product_name: item.productName,
        product_image_url: item.productImageUrl,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.lineTotal,
      })),
    });

    if (error || !newOrderId) {
      if (error?.code === UNIQUE_VIOLATION) {
        // Lost the race to a concurrent request with the same idempotency key.
        const raceWinner = await this.getByIdempotencyKey(data.idempotencyKey);
        if (raceWinner) return raceWinner;
      }
      throw new Error(`Failed to create order: ${error?.message ?? "unknown error"}`);
    }

    const order = await this.getById(newOrderId);
    if (!order) throw new Error(`Order ${newOrderId} not found immediately after creation`);
    return order;
  }

  /** Idempotent checkout: a repeat submission with the same key returns the original order. */
  async getByIdempotencyKey(idempotencyKey: string): Promise<OrderDTO | null> {
    const { data: orderRow, error } = await supabaseAdmin
      .from("orders")
      .select(ORDER_COLUMNS)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (error) throw new Error(`Failed to look up order by idempotency key: ${error.message}`);
    if (!orderRow) return null;

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("id, product_id, product_name, product_image_url, quantity, unit_price, line_total")
      .eq("order_id", orderRow.id);

    if (itemsError) throw new Error(`Failed to fetch order items: ${itemsError.message}`);

    return mapOrderRowToDto(orderRow, items ?? [], decodePaymentMethodNote(orderRow.notes));
  }

  async getById(id: string, userId?: string): Promise<OrderDTO | null> {
    let query = supabaseAdmin.from("orders").select(ORDER_COLUMNS).eq("id", id);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: orderRow, error } = await query.maybeSingle();
    if (error) throw new Error(`Failed to fetch order: ${error.message}`);
    if (!orderRow) return null;

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("id, product_id, product_name, product_image_url, quantity, unit_price, line_total")
      .eq("order_id", id);

    if (itemsError) throw new Error(`Failed to fetch order items: ${itemsError.message}`);

    return mapOrderRowToDto(orderRow, items ?? [], decodePaymentMethodNote(orderRow.notes));
  }

  async listByUser(userId: string): Promise<OrderDTO[]> {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(ORDER_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list orders: ${error.message}`);
    return this.mapOrdersWithItems(orders ?? []);
  }

  async listAll(params: OrderListParams = {}): Promise<OrderListResult> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: orders,
      error,
      count,
    } = await supabaseAdmin
      .from("orders")
      .select(ORDER_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Failed to list orders: ${error.message}`);

    const items = await this.mapOrdersWithItems(orders ?? []);
    const total = count ?? items.length;

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: from + items.length < total,
    };
  }

  async listByStatuses(statuses: OrderStatus[]): Promise<OrderDTO[]> {
    if (statuses.length === 0) return [];

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(ORDER_COLUMNS)
      .in("status", statuses.map(toDbOrderStatus))
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list orders: ${error.message}`);
    return this.mapOrdersWithItems(orders ?? []);
  }

  async listByStatusesForCourier(statuses: OrderStatus[], courierId: string): Promise<OrderDTO[]> {
    if (statuses.length === 0) return [];

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(ORDER_COLUMNS)
      .in("status", statuses.map(toDbOrderStatus))
      .eq("assigned_courier_id", courierId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list courier orders: ${error.message}`);
    return this.mapOrdersWithItems(orders ?? []);
  }

  private async mapOrdersWithItems(
    orders: Array<{
      id: string;
      order_number: number;
      status: Parameters<typeof mapOrderRowToDto>[0]["status"];
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
      assigned_courier_id: string | null;
    }>,
  ): Promise<OrderDTO[]> {
    if (!orders.length) return [];

    const orderIds = orders.map((o) => o.id);
    const { data: allItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select(
        "id, order_id, product_id, product_name, product_image_url, quantity, unit_price, line_total",
      )
      .in("order_id", orderIds);

    if (itemsError) throw new Error(`Failed to list order items: ${itemsError.message}`);

    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems ?? []) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    return orders.map((order) =>
      mapOrderRowToDto(
        order,
        (itemsByOrder.get(order.id) ?? []).map(({ order_id: _, ...rest }) => rest),
        decodePaymentMethodNote(order.notes),
      ),
    );
  }

  async updateStatus(
    id: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<OrderDTO> {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status: toDbOrderStatus(toStatus) })
      .eq("id", id)
      .eq("status", toDbOrderStatus(fromStatus))
      .select("id");

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    if (!data || data.length === 0) {
      // Either the order doesn't exist, or its status no longer matches
      // fromStatus — another action already transitioned it since it was read.
      const current = await this.getById(id);
      if (!current) throw new OrderNotFoundError();
      throw new OrderConcurrentModificationError(
        `Order ${id} is now "${current.status}", expected "${fromStatus}" — another action already changed it`,
      );
    }

    const order = await this.getById(id);
    if (!order) throw new Error(`Order ${id} not found after status update`);
    return order;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<OrderDTO> {
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", id);

    if (error) throw new Error(`Failed to update payment status: ${error.message}`);

    const order = await this.getById(id);
    if (!order) throw new Error(`Order ${id} not found after payment status update`);
    return order;
  }

  async countByStatuses(statuses: OrderStatus[]): Promise<number> {
    if (statuses.length === 0) return 0;

    const { count, error } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", statuses.map(toDbOrderStatus));

    if (error) throw new Error(`Failed to count orders: ${error.message}`);
    return count ?? 0;
  }

  async getTodaySummary(): Promise<{ orderCount: number; revenue: number }> {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const { data, error, count } = await supabaseAdmin
      .from("orders")
      .select("total", { count: "exact" })
      .gte("created_at", startOfDay.toISOString())
      .neq("status", toDbOrderStatus(OrderStatusEnum.CANCELLED));

    if (error) throw new Error(`Failed to summarize today's orders: ${error.message}`);

    const revenue = (data ?? []).reduce((sum, row) => sum + Number(row.total), 0);
    return { orderCount: count ?? data?.length ?? 0, revenue };
  }

  async assignCourier(orderId: string, courierId: string): Promise<OrderDTO> {
    // Conditioned on assigned_courier_id IS NULL — a concurrent assignment race
    // resolves to whichever call wins the UPDATE first; the loser gets back the
    // order as actually persisted (not necessarily with its own courierId), so
    // the caller can tell it lost and must not publish a false courier.assigned.
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ assigned_courier_id: courierId })
      .eq("id", orderId)
      .is("assigned_courier_id", null);

    if (error) throw new Error(`Failed to assign courier: ${error.message}`);

    const order = await this.getById(orderId);
    if (!order) throw new OrderNotFoundError();
    return order;
  }

  async countActiveDeliveriesByCourier(courierId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("assigned_courier_id", courierId)
      .in(
        "status",
        [
          OrderStatusEnum.READY_FOR_DELIVERY,
          OrderStatusEnum.OUT_FOR_DELIVERY,
          OrderStatusEnum.ARRIVED,
        ].map(toDbOrderStatus),
      );

    if (error) throw new Error(`Failed to count courier deliveries: ${error.message}`);
    return count ?? 0;
  }
}
