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
  total: number;
  currency: string;
}

export interface IOrderRepository {
  create(data: CreateOrderData): Promise<OrderDTO>;
  getById(id: string, userId?: string): Promise<OrderDTO | null>;
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
  /** Count only — Dashboard KPI cards (dashboard.md), avoids fetching full order rows. */
  countByStatuses(statuses: OrderStatus[]): Promise<number>;
  /** Orders created since server-computed UTC midnight, excluding CANCELLED — Dashboard KPI cards. */
  getTodaySummary(): Promise<{ orderCount: number; revenue: number }>;
  /** Persists the auto-assignment decision (couriers.md — closes the "no assignment persisted" gap). */
  assignCourier(orderId: string, courierId: string): Promise<OrderDTO>;
  /** Active (READY_FOR_DELIVERY/OUT_FOR_DELIVERY/ARRIVED) deliveries currently assigned to this courier — CourierAssignmentService workload input. */
  countActiveDeliveriesByCourier(courierId: string): Promise<number>;
  /** Filters at the query level to only orders assigned to this courier — closes the shared-queue gap (couriers.md). */
  listByStatusesForCourier(statuses: OrderStatus[], courierId: string): Promise<OrderDTO[]>;
}
