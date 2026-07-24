export { CheckoutModule } from "./checkout";
export type {
  ICartModule,
  IProductModule,
  IOrderModule,
  IPaymentModule,
  INotificationModule,
  ICheckoutSessionStore,
} from "./checkout/contracts";
export type {
  CreateCheckoutDto,
  CheckoutValidationIssue,
  CheckoutValidationResult,
} from "./checkout/dto";
export {
  type CheckoutSession,
  type CheckoutSessionStatus,
  type CheckoutResult,
  type CheckoutContext,
  type CheckoutCartLine,
  createCheckoutSession,
  withCheckoutSessionStatus,
} from "./checkout/models";
export {
  CheckoutService,
  CheckoutPolicy,
  CheckoutProcess,
  InMemoryCheckoutSessionStore,
} from "./checkout";

/** @deprecated Use CreateCheckoutDto */
export type { CreateCheckoutDto as CreateCheckoutInput } from "./checkout/dto";
/** @deprecated Use CheckoutResult */
export type { CheckoutResult as PlaceOrderResult } from "./checkout/models";
