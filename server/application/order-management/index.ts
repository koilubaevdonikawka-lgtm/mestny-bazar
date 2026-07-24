export type { IOrderRepository } from "./contracts/order-repository.contract";
export type { ICheckoutOrderReader } from "./contracts/checkout-order-reader.contract";
export type { IOrderStatusProvider } from "./contracts/order-status-provider.contract";
export type { IOrderHistoryRepository } from "./contracts/order-history-repository.contract";
export type { IOrderEventPublisher } from "./contracts/order-event-publisher.contract";
export type { IOrderAnalyticsProvider } from "./contracts/order-analytics-provider.contract";
export type {
  IOrderPaymentGateway,
  IOrderDeliveryProvider,
  IOrderWarehouseProvider,
  IOrderNotificationProvider,
  IOrderAnalyticsContext,
} from "./contracts/order-extension-ports.contract";
export {
  OrderManagementStatus,
  createCustomerOrder,
  withOrderStatus,
} from "./models/customer-order.model";
export type { CustomerOrder, OrderLine } from "./models/customer-order.model";
export {
  createOrderHistoryEntry,
} from "./models/order-history.model";
export type {
  OrderHistoryEntry,
  OrderHistoryView,
  CancelOrderResult,
  CustomerOrdersListResult,
} from "./models/order-history.model";
export { OrderManagementService, isOrderManagementStatus } from "./services/order-management.service";
export { OrderManagementApplicationService } from "./services/order-management-application.service";
export {
  CreateOrderUseCase,
  GetOrderUseCase,
  GetCustomerOrdersUseCase,
  UpdateOrderStatusUseCase,
  CancelOrderUseCase,
  GetOrderHistoryUseCase,
} from "./use-cases/order-management.use-cases";
