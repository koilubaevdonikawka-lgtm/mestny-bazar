import type { CheckoutSession } from "@server/application/modules/checkout/checkout/models";
import type { ICheckoutSessionStore } from "@server/application/modules/checkout/checkout/contracts";

/** In-memory checkout session store for the checkout process module. */
export class InMemoryCheckoutSessionStore implements ICheckoutSessionStore {
  private readonly sessions = new Map<string, CheckoutSession>();

  async save(session: CheckoutSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(sessionId: string): Promise<CheckoutSession | null> {
    return this.sessions.get(sessionId) ?? null;
  }
}
