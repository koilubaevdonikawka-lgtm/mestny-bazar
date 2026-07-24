export { Seller, type RegisterSellerProps, type ReconstituteSellerProps, type SellerReadModel } from "./aggregate";
export { SellerSnapshot } from "./snapshot/seller-snapshot";
export {
  SellerId,
  SellerName,
  SellerPhone,
  SellerEmail,
  SellerAddress,
  SellerRating,
  SellerStatus,
  SellerVerification,
  SellerLimits,
  type SellerVerificationLevel,
} from "./value-objects";
export {
  SellerLifecycleStatus,
  SELLER_LIFECYCLE_STATUS_VALUES,
  isSellerLifecycleStatus,
  isOperationalSellerStatus,
  isTerminalSellerStatus,
} from "./status/seller-status";
export { SellerLifecycle, type SellerLifecycleAction } from "./lifecycle/seller-lifecycle";
export { SellerTransitionRules, SELLER_TRANSITION_RULES } from "./lifecycle/transition-rules";
export {
  SellerStateBehaviorRegistry,
  type SellerStateBehavior,
} from "./lifecycle/state-behavior";
export {
  SellerPolicy,
  VerificationPolicy,
  PublishingPolicy,
  SellerLimitsPolicy,
  SuspensionPolicy,
  type SellerPolicySnapshot,
  type SellerLimitsUsage,
} from "./policies/seller.policy";
export { DomainEvent } from "./events/domain-event.base";
export {
  SellerRegisteredEvent,
  SellerUpdatedEvent,
  SellerVerifiedEvent,
  SellerActivatedEvent,
  SellerSuspendedEvent,
  SellerBlockedEvent,
  SellerArchivedEvent,
  type SellerDomainEvent,
  type SellerDomainEventType,
} from "./events/seller.events";
export {
  SellerDomainError,
  InvalidSellerIdError,
  InvalidSellerNameError,
  InvalidSellerPhoneError,
  InvalidSellerEmailError,
  InvalidSellerAddressError,
  InvalidSellerRatingError,
  InvalidSellerStatusError,
  InvalidSellerVerificationError,
  InvalidSellerLimitsError,
  SellerLifecycleViolationError,
  SellerPolicyViolationError,
  SellerInvariantViolationError,
} from "./exceptions/seller.errors";
