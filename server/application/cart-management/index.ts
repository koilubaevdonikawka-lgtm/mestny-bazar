export type { ICartRepository } from "./contracts/cart-repository.contract";
export type { ICatalogCartReader } from "./contracts/catalog-cart-reader.contract";
export type {
  ICartPricingProvider,
  CartPricingLine,
} from "./contracts/cart-pricing-provider.contract";
export type { ICartInventoryProvider } from "./contracts/cart-inventory-provider.contract";
export type { ICartEventPublisher } from "./contracts/cart-event-publisher.contract";
export type { ICartAnalyticsProvider } from "./contracts/cart-analytics-provider.contract";
export type {
  ICartPricingEngine,
  ICartPromotionEngine,
  ICartInventoryContext,
  ICartRecommendationEngine,
  ICartAnalyticsContext,
  ICartNotificationProvider,
} from "./contracts/cart-extension-ports.contract";
export type { CartLine } from "./models/cart-line.model";
export { createCartLine } from "./models/cart-line.model";
export type {
  CartItemView,
  CartView,
  CartTotalResult,
  CartValidationIssue,
  CartValidationResult,
  ClearCartResult,
  RemoveCartItemResult,
} from "./models/cart-view.model";
export { CartManagementService } from "./services/cart-management.service";
export { CartManagementApplicationService } from "./services/cart-management-application.service";
export {
  AddProductToCartUseCase,
  UpdateCartItemQuantityUseCase,
  RemoveProductFromCartUseCase,
  GetCartUseCase,
  ClearCartUseCase,
  CalculateCartTotalUseCase,
  ValidateCartUseCase,
} from "./use-cases/cart-management.use-cases";
