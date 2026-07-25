import type { OrderDTO, OrderStatus, PaymentStatus } from "@shared/contracts/order";
import type { CreateOrderData, IOrderRepository } from "@server/ports/order.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { mapOrderRowToDto, toDbOrderStatus } from "@server/adapters/supabase/order.mapper";
import { isUuid } from "@server/domain/shared/uuid";

function encodePaymentMethodNote(method: OrderDTO["paymentMethod"]): string {
  return `payment_method:${method}`;
}

function decodePaymentMethodNote(notes: string | null): OrderDTO["paymentMethod"] {
  if (!notes) return "CASH";
  const match = notes.match(/payment_method:(ONLINE|CASH)/);
  return match?.[1] === "ONLINE" ? "ONLINE" : "CASH";
}

function mergeNotes(
  userNotes: string | undefined,
  paymentMethod: OrderDTO["paymentMethod"],
): string | null {
  const methodTag = encodePaymentMethodNote(paymentMethod);
  if (!userNotes?.trim()) return methodTag;
  return `${userNotes.trim()}\n${methodTag}`;
}

const ORDER_COLUMNS =
  "id, order_number, status, payment_status, subtotal, delivery_fee, total, currency, customer_name, customer_phone, address_snapshot, notes, finik_payment_url, paid_at, created_at";

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

    const { data: orderRow, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
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
      })
      .select(ORDER_COLUMNS)
      .single();

    if (orderError || !orderRow) {
      if (orderError?.code === UNIQUE_VIOLATION) {
        // Lost the race to a concurrent request with the same idempotency key.
        const raceWinner = await this.getByIdempotencyKey(data.idempotencyKey);
        if (raceWinner) return raceWinner;
      }
      throw new Error(`Failed to create order: ${orderError?.message ?? "unknown error"}`);
    }

    const itemRows = data.items.map((item) => ({
      order_id: orderRow.id,
      product_id: isUuid(item.productId) ? item.productId : null,
      product_name: item.productName,
      product_image_url: item.productImageUrl,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      line_total: item.lineTotal,
    }));

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(itemRows)
      .select("id, product_id, product_name, product_image_url, quantity, unit_price, line_total");

    if (itemsError || !insertedItems) {
      await supabaseAdmin.from("orders").delete().eq("id", orderRow.id);
      throw new Error(`Failed to create order items: ${itemsError?.message ?? "unknown error"}`);
    }

    return mapOrderRowToDto(orderRow, insertedItems, paymentMethod);
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

  async listAll(): Promise<OrderDTO[]> {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(ORDER_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list orders: ${error.message}`);
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

  async updateStatus(id: string, status: OrderStatus): Promise<OrderDTO> {
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: toDbOrderStatus(status) })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
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
}
