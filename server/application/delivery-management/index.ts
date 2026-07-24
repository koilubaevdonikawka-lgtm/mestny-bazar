export type { IOrderDeliveryReader, OrderDeliverySnapshot } from "./contracts/order-delivery-reader.contract";
export type { IDeliveryRepository } from "./contracts/delivery-repository.contract";
export type { ICourierProvider, CourierInfo } from "./contracts/courier-provider.contract";
export type { IDeliveryStatusProvider } from "./contracts/delivery-status-provider.contract";
export type { IDeliveryHistoryRepository } from "./contracts/delivery-history-repository.contract";
export type { IDeliveryEventPublisher } from "./contracts/delivery-event-publisher.contract";
export type {
  ICourierManagement,
  IRouteOptimization,
  IWarehouseManagement,
  IDeliveryNotificationProvider,
  IGeoTracking,
  IDeliveryAnalyticsProvider,
} from "./contracts/delivery-extension-ports.contract";
export {
  DeliveryStatus,
  createDelivery,
  withDeliveryStatus,
  withCourierId,
  isDeliveryStatus,
} from "./models/delivery.model";
export type { Delivery } from "./models/delivery.model";
export { createDeliveryHistoryEntry } from "./models/delivery-history.model";
export type {
  DeliveryHistoryEntry,
  DeliveryHistoryView,
  CancelDeliveryResult,
  AssignCourierResult,
  DeliveriesListResult,
} from "./models/delivery-history.model";
export { DeliveryManagementService } from "./services/delivery-management.service";
export { DeliveryManagementApplicationService } from "./services/delivery-management-application.service";
export {
  CreateDeliveryUseCase,
  AssignCourierUseCase,
  UpdateDeliveryStatusUseCase,
  GetDeliveryUseCase,
  GetDeliveriesUseCase,
  CancelDeliveryUseCase,
  GetDeliveryHistoryUseCase,
} from "./use-cases/delivery-management.use-cases";
