import type {
  CreateOrderRequest,
  OrderDTO,
  OrderListParams,
  OrderListResult,
  OrderStatus,
  PaymentStatus,
} from "@shared/contracts/order";

export interface OrderLineItemInput {
  productId: string;
  /** Stage 17 — see CreateOrderItemRequest.variantId; a plain pass-through identifier. */
  variantId: string | null;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CreateOrderData extends Omit<
  CreateOrderRequest,
  "items" | "addressId" | "zoneId"
> {
  userId: string | null;
  items: OrderLineItemInput[];
  addressId: string | null;
  addressSnapshot: string;
  zoneId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  deliveryTariffId: string | null;
  deliveryEtaMinMinutes: number | null;
  deliveryEtaMaxMinutes: number | null;
  discountAmount: number;
  total: number;
  currency: string;
}

/**
 * `created` is false when create() returned an already-existing order for
 * this idempotency key instead of inserting one (a concurrent duplicate
 * request that lost the race) — the caller uses it to fire once-per-order
 * side effects (order.created) only for the request that actually created it.
 */
export interface CreateOrderResult {
  order: OrderDTO;
  created: boolean;
}

export interface IOrderRepository {
  create(data: CreateOrderData): Promise<CreateOrderResult>;
  getById(id: string, userId?: string): Promise<OrderDTO | null>;
  /**
   * Задача №278 — warehouse assembly screen only (WarehouseOrderService).
   * Same order as getById, but items are joined to their product's category
   * (order_items.product_id -> products.category_id -> categories.sort_order)
   * and sorted: category display order first, then the product's own manual
   * sort_order within that category — so the picker sees items grouped by
   * category instead of cart-insertion order. An item whose category can't
   * be resolved (product deleted, or left without a category) sorts after
   * every resolvable item rather than breaking the sort. Every other caller
   * (buyer order history/detail, courier, general admin) keeps using
   * getById and sees items in their original order — unaffected by this.
   */
  getForAssembly(id: string): Promise<OrderDTO | null>;
  /**
   * Задача №281 — admin "Заказы" detail only (AdminOrderService.getOrder).
   * Same as getById, but each item also carries productDescription, joined
   * from products.description by product_id. An item whose product was
   * deleted (order_items.product_id nulled by ON DELETE SET NULL) or has no
   * description gets productDescription: null — the line still renders from
   * its own snapshotted name. Item order is untouched. Buyer/courier reads
   * keep using getById and never see the description.
   */
  getForAdmin(id: string): Promise<OrderDTO | null>;
  getByIdempotencyKey(idempotencyKey: string): Promise<OrderDTO | null>;
  listByUser(userId: string): Promise<OrderDTO[]>;
  listAll(params?: OrderListParams): Promise<OrderListResult>;
  /** Filters at the query level — for role-specific work queues (warehouse, courier). */
  listByStatuses(statuses: OrderStatus[]): Promise<OrderDTO[]>;
  /**
   * Optimistic concurrency: only applies the transition if the row's current
   * status still matches `fromStatus` at write time. Throws
   * OrderConcurrentModificationError if another action already changed it —
   * callers read a status, decide a transition is allowed based on that read,
   * then write; two concurrent actions racing that check-then-act window must
   * not both succeed (e.g. two couriers accepting the same order).
   */
  updateStatus(id: string, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<OrderDTO>;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<OrderDTO>;
  /**
   * Задача №132 — single atomic write for the CREATED/PAID→PAID payment
   * confirmation, setting `status`, `payment_status`, and `paid_at` all in
   * one UPDATE statement (same optimistic-concurrency guard as
   * updateStatus: only applies if the row's status still matches
   * `fromStatus`). Replaces the previous two-separate-calls sequence
   * (updateStatus then updatePaymentStatus) in OrderService.confirmPayment(),
   * which could leave an order stuck with status=PAID but
   * payment_status!="paid" if the process was interrupted between the two
   * writes (order #104, Задача №131) — a single statement makes that
   * partial state impossible to produce going forward.
   */
  confirmPaid(id: string, fromStatus: OrderStatus): Promise<OrderDTO>;
  /** Count only — Dashboard KPI cards (dashboard.md), avoids fetching full order rows. */
  countByStatuses(statuses: OrderStatus[]): Promise<number>;
  /** Orders created since server-computed UTC midnight, excluding CANCELLED — Dashboard KPI cards. */
  getTodaySummary(): Promise<{ orderCount: number; revenue: number }>;
  /** Persists the auto-assignment decision (couriers.md — closes the "no assignment persisted" gap). */
  assignCourier(orderId: string, courierId: string): Promise<OrderDTO>;
  /** Active (READY_FOR_DELIVERY/OUT_FOR_DELIVERY/ARRIVED) deliveries currently assigned to this courier — CourierAssignmentService workload input. */
  countActiveDeliveriesByCourier(courierId: string): Promise<number>;
  /**
   * Задача №212 — single atomic write for a courier physically collecting a
   * CASH order's payment: sets payment_status/paid_at (same contract as
   * updatePaymentStatus's "paid" branch) plus the dedicated
   * cash_collected_at/cash_collected_by pair that getCashCollectedTodayByCourier
   * below aggregates from — kept separate from updatePaymentStatus so the
   * ONLINE/Finik webhook path never touches these two columns.
   */
  markCashCollected(orderId: string, courierId: string): Promise<OrderDTO>;
  /** Sum of order.total for this courier's cash collections since server-computed UTC midnight — same "today" convention as getTodaySummary. Admin Couriers card. */
  getCashCollectedTodayByCourier(courierId: string): Promise<number>;
  /** Filters at the query level to only orders assigned to this courier — closes the shared-queue gap (couriers.md). */
  listByStatusesForCourier(statuses: OrderStatus[], courierId: string): Promise<OrderDTO[]>;
  /** Paginated order history for a specific courier — Couriers admin detail card (Промпт №068). */
  listByCourier(courierId: string, params?: OrderListParams): Promise<OrderListResult>;
  /** analytics.md — orders created within [periodStart, periodEnd], for sales aggregation. Not paginated: callers are internal aggregators, not staff-facing lists. */
  listInPeriod(periodStart: string, periodEnd: string): Promise<OrderDTO[]>;
}
