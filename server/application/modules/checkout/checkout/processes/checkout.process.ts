import type { CartSnapshot } from "@server/application/modules/cart/cart/models";
import type {
  ICartModule,
  INotificationModule,
  IOrderModule,
  IPaymentModule,
  IProductModule,
} from "@server/application/modules/checkout/checkout/contracts";
import type { CustomerModule } from "@server/application/modules/customer/customer/api/customer.module";
import {
  createCheckoutContext,
  type CheckoutCartLine,
  type CheckoutContext,
  createCheckoutResult,
  type CheckoutResult,
  withCheckoutContextCart,
  withCheckoutContextCustomer,
  withCheckoutContextOrder,
  withCheckoutContextPayment,
  withCheckoutContextPricing,
} from "@server/application/modules/checkout/checkout/models";
import { CheckoutPolicy } from "@server/application/modules/checkout/checkout/services/checkout-policy";
import type { PricingModule } from "@server/application/modules/pricing/pricing/api/pricing.module";

/** Checkout business process orchestrator — coordinates capability modules through public contracts. */
export class CheckoutProcess {
  private readonly policy = new CheckoutPolicy();

  constructor(
    private readonly cart: ICartModule,
    private readonly products: IProductModule,
    private readonly pricing: PricingModule,
    private readonly orders: IOrderModule,
    private readonly payments: IPaymentModule,
    private readonly notifications: INotificationModule,
    private readonly customers: CustomerModule,
  ) {}

  async execute(context: CheckoutContext): Promise<CheckoutResult> {
    let state = context;
    state = await this.stepLoadCustomer(state);
    state = await this.stepLoadCart(state);
    state = await this.stepVerifyProductsExist(state);
    state = await this.stepVerifyStock(state);
    state = await this.stepCalculatePrices(state);
    state = await this.stepCreateOrder(state);
    state = await this.stepCreatePayment(state);
    return this.stepBuildResult(state);
  }

  async runValidationSteps(context: CheckoutContext): Promise<CheckoutContext> {
    let state = context;
    state = await this.stepLoadCustomer(state);
    state = await this.stepLoadCart(state);
    state = await this.stepVerifyProductsExist(state);
    state = await this.stepVerifyStock(state);
    state = await this.stepCalculatePrices(state);
    return state;
  }

  validateSession(context: CheckoutContext) {
    if (!context.cart) {
      throw new Error("Cart is required for checkout validation.");
    }
    return this.policy.validate(context.session, context.cart, context);
  }

  private async stepLoadCustomer(context: CheckoutContext): Promise<CheckoutContext> {
    const customer = await this.customers.getCustomer(context.session.customerId);
    if (!customer) {
      throw new Error(`Customer not found: ${context.session.customerId}`);
    }

    const defaultAddress = await this.customers.getDefaultAddress(context.session.customerId);
    return withCheckoutContextCustomer(context, customer, defaultAddress);
  }

  private async stepLoadCart(context: CheckoutContext): Promise<CheckoutContext> {
    const cart = await this.cart.getCart(context.session.customerId);
    return withCheckoutContextCart(context, cart, toCheckoutLines(cart));
  }

  private async stepVerifyProductsExist(context: CheckoutContext): Promise<CheckoutContext> {
    const lines = requireLines(context);
    const result = await this.products.verifyProductsExist(lines);
    assertVerification(result, "products");
    return context;
  }

  private async stepVerifyStock(context: CheckoutContext): Promise<CheckoutContext> {
    const lines = requireLines(context);
    const result = await this.products.verifyStock(lines);
    assertVerification(result, "stock");
    return context;
  }

  private async stepCalculatePrices(context: CheckoutContext): Promise<CheckoutContext> {
    const lines = requireLines(context);
    const calculations = [];

    for (const line of lines) {
      const calculation = await this.pricing.calculatePrice({
        productId: line.productId,
        quantity: line.quantity,
        currency: line.currency,
      });

      if (
        calculation.unitPrice.amount !== line.priceAmount ||
        calculation.currency !== line.currency
      ) {
        throw new Error(
          `Checkout prices verification failed: cart price does not match calculated price for product ${line.productId}.`,
        );
      }

      calculations.push(calculation);
    }

    return withCheckoutContextPricing(context, Object.freeze(calculations));
  }

  private async stepCreateOrder(context: CheckoutContext): Promise<CheckoutContext> {
    const lines = requireLines(context);
    const cart = requireCart(context);
    const customer = requireCustomer(context);
    const defaultAddress = requireDefaultAddress(context);
    const pricingTotals = requirePricingTotals(context);
    const priceCalculations = requirePriceCalculations(context);

    const order = await this.orders.createOrder({
      customerId: context.session.customerId,
      address: defaultAddress.fullAddress,
      phone: customer.profile.contact.phone,
      comment: context.session.comment,
      paymentMethod: context.session.paymentMethod,
      deliveryMethod: context.session.deliveryMethod,
      currency: cart.totals.currency,
      items: lines.map((line, index) => {
        const calculation = priceCalculations[index];
        if (!calculation) {
          throw new Error(`Missing pricing calculation for product ${line.productId}.`);
        }

        return Object.freeze({
          ...line,
          priceAmount: calculation.unitPrice.amount,
          currency: calculation.currency,
        });
      }),
      pricingSnapshot: Object.freeze({
        subtotal: pricingTotals.subtotal,
        discount: pricingTotals.discount,
        total: pricingTotals.total,
        currency: pricingTotals.currency,
        lines: Object.freeze(
          priceCalculations.map((calculation) =>
            Object.freeze({
              productId: calculation.productId,
              quantity: calculation.quantity,
              unitPriceAmount: calculation.unitPrice.amount,
              currency: calculation.currency,
              subtotal: calculation.subtotal,
              discountAmount: calculation.discountAmount,
              promotionAmount: calculation.promotionAmount,
              total: calculation.total,
            }),
          ),
        ),
      }),
    });
    return withCheckoutContextOrder(context, order);
  }

  private async stepCreatePayment(context: CheckoutContext): Promise<CheckoutContext> {
    const pricingTotals = requirePricingTotals(context);
    const order = requireOrder(context);
    const payment = await this.payments.createPayment({
      orderId: order.id,
      amount: pricingTotals.total,
      currency: pricingTotals.currency,
      method: context.session.paymentMethod,
    });
    await this.notifications.notifyOrderCreated({
      orderId: order.id,
      customerId: context.session.customerId,
    });
    return withCheckoutContextPayment(context, payment);
  }

  private stepBuildResult(context: CheckoutContext): CheckoutResult {
    const order = requireOrder(context);
    const payment = requirePayment(context);
    return createCheckoutResult({
      session: context.session,
      order,
      payment,
    });
  }
}

function toCheckoutLines(cart: CartSnapshot): readonly CheckoutCartLine[] {
  return Object.freeze(
    cart.items.map((item) =>
      Object.freeze({
        productId: item.productId,
        sellerId: item.sellerId,
        catalogId: item.catalogId,
        name: item.name,
        priceAmount: item.priceAmount,
        currency: item.currency,
        quantity: item.quantity,
      }),
    ),
  );
}

function requireLines(context: CheckoutContext): readonly CheckoutCartLine[] {
  if (!context.lines) {
    throw new Error("Checkout lines are required.");
  }
  return context.lines;
}

function requireCart(context: CheckoutContext): CartSnapshot {
  if (!context.cart) {
    throw new Error("Cart is required.");
  }
  return context.cart;
}

function requireCustomer(context: CheckoutContext) {
  if (!context.customer) {
    throw new Error("Customer is required.");
  }
  return context.customer;
}

function requireDefaultAddress(context: CheckoutContext) {
  if (!context.defaultAddress) {
    throw new Error("Default delivery address is required.");
  }
  return context.defaultAddress;
}

function requireOrder(context: CheckoutContext) {
  if (!context.order) {
    throw new Error("Order is required.");
  }
  return context.order;
}

function requirePayment(context: CheckoutContext) {
  if (!context.payment) {
    throw new Error("Payment is required.");
  }
  return context.payment;
}

function requirePriceCalculations(context: CheckoutContext) {
  if (!context.priceCalculations) {
    throw new Error("Pricing calculations are required.");
  }
  return context.priceCalculations;
}

function requirePricingTotals(context: CheckoutContext) {
  if (!context.pricingTotals) {
    throw new Error("Pricing totals are required.");
  }
  return context.pricingTotals;
}

function assertVerification(
  result: { valid: boolean; issues: readonly { message: string }[] },
  step: string,
): void {
  if (!result.valid) {
    const message = result.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Checkout ${step} verification failed: ${message}`);
  }
}

export { createCheckoutContext };
