export { Product, type CreateProductProps, type ProductReadModel, type ReconstituteProductProps } from "./aggregate";
export { ProductSnapshot } from "./snapshot/product-snapshot";
export {
  ProductId,
  ProductName,
  ProductDescription,
  ProductPrice,
  ProductInventory,
  ProductMedia,
  ProductAttributes,
  type ProductMediaItem,
} from "./value-objects";
export {
  ProductStatus,
  PRODUCT_STATUS_VALUES,
  assertProductStatus,
  isProductStatus,
  isPubliclyVisibleStatus,
  isTerminalProductStatus,
} from "./status/product-status";
export { ProductLifecycle, type ProductLifecycleAction } from "./lifecycle/product-lifecycle";
export {
  ProductPolicy,
  PublicationPolicy,
  PricingPolicy,
  InventoryPolicy,
  VisibilityPolicy,
  type ProductPolicySnapshot,
} from "./policies/product.policy";
export { ProductTransitionRules, PRODUCT_TRANSITION_RULES } from "./lifecycle/transition-rules";
export {
  ProductStateBehaviorRegistry,
  type ProductStateBehavior,
} from "./lifecycle/state-behavior";
export { DomainEvent } from "./events/domain-event.base";
export {
  ProductCreatedEvent,
  ProductUpdatedEvent,
  ProductPriceChangedEvent,
  ProductInventoryChangedEvent,
  ProductMediaChangedEvent,
  ProductStatusChangedEvent,
  ProductArchivedEvent,
  type ProductDomainEvent,
  type ProductDomainEventType,
} from "./events/product.events";
export {
  ProductDomainError,
  InvalidProductIdError,
  InvalidProductNameError,
  InvalidProductDescriptionError,
  InvalidProductPriceError,
  InvalidProductInventoryError,
  InvalidProductMediaError,
  InvalidProductAttributesError,
  InvalidSellerIdError,
  ProductLifecycleViolationError,
  ProductPolicyViolationError,
  ProductInvariantViolationError,
} from "./exceptions/product.errors";
