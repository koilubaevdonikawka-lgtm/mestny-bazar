import type { ICartModule, ICheckoutSessionStore } from "@server/application/modules/checkout/checkout/contracts";
import type { CreateCheckoutDto, CheckoutValidationResult } from "@server/application/modules/checkout/checkout/dto";
import {
  createCheckoutSession,
  createCheckoutResult,
  type CheckoutResult,
  type CheckoutSession,
  withCheckoutSessionStatus,
} from "@server/application/modules/checkout/checkout/models";
import { CheckoutProcess, createCheckoutContext } from "@server/application/modules/checkout/checkout/processes";
import type { IIdGenerator } from "@server/application/ports";

/** Checkout process service — manages sessions and delegates orchestration to CheckoutProcess. */
export class CheckoutService {
  constructor(
    private readonly sessions: ICheckoutSessionStore,
    private readonly process: CheckoutProcess,
    private readonly cart: ICartModule,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createCheckout(input: CreateCheckoutDto): Promise<CheckoutSession> {
    const session = createCheckoutSession({
      id: this.idGenerator.generate(),
      customerId: input.customerId,
      paymentMethod: input.paymentMethod,
      deliveryMethod: input.deliveryMethod,
      comment: input.comment,
    });

    await this.sessions.save(session);
    return session;
  }

  async validateCheckout(sessionId: string): Promise<CheckoutValidationResult> {
    const session = await this.requireSession(sessionId);
    const context = await this.process.runValidationSteps(createCheckoutContext(session));
    const validation = this.process.validateSession(context);

    if (validation.valid) {
      await this.sessions.save(withCheckoutSessionStatus(session, "validated"));
    }

    return validation;
  }

  async placeOrder(sessionId: string): Promise<CheckoutResult> {
    const session = await this.requireSession(sessionId);
    const context = createCheckoutContext(session);
    const validation = this.process.validateSession(
      await this.process.runValidationSteps(context),
    );

    if (!validation.valid) {
      const message = validation.issues.map((issue) => issue.message).join("; ");
      throw new Error(`Checkout validation failed: ${message}`);
    }

    const result = await this.process.execute(createCheckoutContext(session));
    const placedSession = withCheckoutSessionStatus(result.session, "placed");
    await this.sessions.save(placedSession);
    await this.cart.clearCart(session.customerId);

    return createCheckoutResult({
      session: placedSession,
      order: result.order,
      payment: result.payment,
    });
  }

  async getCheckout(sessionId: string): Promise<CheckoutSession | null> {
    return this.sessions.findById(sessionId);
  }

  private async requireSession(sessionId: string): Promise<CheckoutSession> {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new Error(`Checkout session not found: ${sessionId}`);
    }
    return session;
  }
}
