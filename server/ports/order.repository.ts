import type {
  CreateOrderRequest,
  OrderDTO,
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
  listAll(): Promise<OrderDTO[]>;
  /** Filters at the query level — for role-specific work queues (warehouse, courier). */
  listByStatuses(statuses: OrderStatus[]): Promise<OrderDTO[]>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderDTO>;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<OrderDTO>;
}
