/**
 * Checkout Management — collects confirmed cart, validates readiness, creates Order Draft.
 *
 * Does NOT store products or perform payment.
 * Cart data via ICartCheckoutReader; product data via ICatalogCheckoutReader.
 * No Product BCM or Cart BCM access.
 */
import type { ICartCheckoutReader } from "@server/application/checkout-management/contracts/cart-checkout-reader.contract";
import type { ICatalogCheckoutReader } from "@server/application/checkout-management/contracts/catalog-checkout-reader.contract";
import type { ICheckoutEventPublisher } from "@server/application/checkout-management/contracts/checkout-event-publisher.contract";
import type { ICheckoutPricingProvider } from "@server/application/checkout-management/contracts/checkout-pricing-provider.contract";
import type { ICheckoutRepository } from "@server/application/checkout-management/contracts/checkout-repository.contract";
import type { ICheckoutValidationProvider } from "@server/application/checkout-management/contracts/checkout-validation-provider.contract";
import {
  CheckoutStatus,
  createOrderDraft,
  type CheckoutLineDraft,
  type OrderDraft,
  withCancelledOrderDraft,
  withUpdatedOrderDraft,
} from "@server/application/checkout-management/models/order-draft.model";
import type {
  CancelCheckoutResult,
  CheckoutSummary,
  CheckoutValidationResult,
} from "@server/application/checkout-management/models/checkout-view.model";
import type { IIdGenerator } from "@server/application/ports";

export class CheckoutManagementService {
  constructor(
    private readonly checkoutRepository: ICheckoutRepository,
    private readonly cartReader: ICartCheckoutReader,
    private readonly catalogReader: ICatalogCheckoutReader,
    private readonly pricingProvider: ICheckoutPricingProvider,
    private readonly validationProvider: ICheckoutValidationProvider,
    private readonly eventPublisher: ICheckoutEventPublisher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createCheckout(customerId: string): Promise<CheckoutSummary> {
    const cart = await this.cartReader.getCart(customerId);
    if (cart.items.length === 0) {
      throw new Error("Cart is empty.");
    }

    const cartValidation = await this.cartReader.validateCart(customerId);
    if (!cartValidation.valid) {
      throw new Error("Cart is not valid for checkout.");
    }

    const lines = await this.buildLinesFromCart(cart.items);
    const totals = this.pricingProvider.calculateSubtotal(lines);
    const validation = await this.validationProvider.validateDraft(customerId, lines);

    const draft = createOrderDraft({
      checkoutId: this.idGenerator.generate(),
      customerId,
      lines,
      subtotal: totals.subtotal,
      currency: totals.currency,
    });

    await this.checkoutRepository.save(draft);
    await this.eventPublisher.publishCreated(draft.checkoutId, customerId);

    return this.toSummary(draft, validation);
  }

  async validateCheckout(customerId: string, checkoutId?: string): Promise<CheckoutValidationResult> {
    if (checkoutId) {
      const draft = await this.requireDraft(checkoutId);
      if (draft.customerId !== customerId.trim()) {
        throw new Error("Checkout does not belong to customer.");
      }
      const validation = await this.validationProvider.validateDraft(customerId, draft.lines);
      await this.eventPublisher.publishValidated(checkoutId, validation.valid);
      return validation;
    }

    const cartValidation = await this.cartReader.validateCart(customerId);
    const cart = await this.cartReader.getCart(customerId);
    if (cart.items.length === 0) {
      return {
        valid: false,
        ready: false,
        issues: [{ code: "EMPTY_CART", message: "Cart is empty." }],
      };
    }

    const lines = await this.buildLinesFromCart(cart.items);
    const draftValidation = await this.validationProvider.validateDraft(customerId, lines);

    return {
      valid: cartValidation.valid && draftValidation.valid,
      ready: cartValidation.valid && draftValidation.ready,
      issues: Object.freeze([...cartValidation.issues.map(toCartIssue), ...draftValidation.issues]),
    };
  }

  async getCheckoutSummary(checkoutId: string): Promise<CheckoutSummary | null> {
    const draft = await this.checkoutRepository.findById(checkoutId);
    if (!draft || draft.status !== CheckoutStatus.Draft) {
      return null;
    }

    const validation = await this.validationProvider.validateDraft(draft.customerId, draft.lines);
    return this.toSummary(draft, validation);
  }

  async refreshCheckout(customerId: string, checkoutId: string): Promise<CheckoutSummary> {
    const draft = await this.requireDraft(checkoutId);
    if (draft.customerId !== customerId.trim()) {
      throw new Error("Checkout does not belong to customer.");
    }

    const cart = await this.cartReader.getCart(customerId);
    const lines = await this.buildLinesFromCart(cart.items);
    const totals = this.pricingProvider.calculateSubtotal(lines);
    const updated = withUpdatedOrderDraft(draft, lines, totals.subtotal, totals.currency);

    await this.checkoutRepository.update(updated);
    await this.eventPublisher.publishRefreshed(checkoutId);

    const validation = await this.validationProvider.validateDraft(customerId, lines);
    return this.toSummary(updated, validation);
  }

  async cancelCheckout(customerId: string, checkoutId: string): Promise<CancelCheckoutResult> {
    const draft = await this.checkoutRepository.findById(checkoutId);
    if (!draft || draft.customerId !== customerId.trim()) {
      return { cancelled: false };
    }

    if (draft.status === CheckoutStatus.Cancelled) {
      return { cancelled: true };
    }

    await this.checkoutRepository.update(withCancelledOrderDraft(draft));
    await this.eventPublisher.publishCancelled(checkoutId, customerId);
    return { cancelled: true };
  }

  private async requireDraft(checkoutId: string): Promise<OrderDraft> {
    const draft = await this.checkoutRepository.findById(checkoutId);
    if (!draft || draft.status !== CheckoutStatus.Draft) {
      throw new Error(`Checkout draft not found: ${checkoutId}`);
    }
    return draft;
  }

  private async buildLinesFromCart(
    items: ReadonlyArray<{
      productId: string;
      quantity: number;
      unitPrice: number;
      currency: string;
      product: { sellerId: string; name: string; price: { amount: number; currency: string } } | null;
    }>,
  ): Promise<readonly CheckoutLineDraft[]> {
    const productIds = items.map((item) => item.productId);
    const products = await this.catalogReader.getProducts(productIds);
    const productMap = new Map(products.map((product) => [product.id, product]));

    return items.map((item) => {
      const product = productMap.get(item.productId) ?? item.product;
      const unitPrice = product?.price.amount ?? item.unitPrice;
      const currency = product?.price.currency ?? item.currency;
      const line: CheckoutLineDraft = Object.freeze({
        productId: item.productId,
        sellerId: product?.sellerId ?? "unknown",
        productName: product?.name ?? "Unknown product",
        quantity: item.quantity,
        unitPrice,
        currency,
        lineTotal: this.pricingProvider.calculateLineTotal({ unitPrice, quantity: item.quantity }),
      });
      return line;
    });
  }

  private toSummary(draft: OrderDraft, validation: CheckoutValidationResult): CheckoutSummary {
    const itemCount = draft.lines.reduce((sum, line) => sum + line.quantity, 0);
    return Object.freeze({
      checkoutId: draft.checkoutId,
      customerId: draft.customerId,
      status: draft.status,
      items: draft.lines,
      subtotal: draft.subtotal,
      currency: draft.currency,
      itemCount,
      ready: validation.ready,
      issues: validation.issues,
    });
  }
}

function toCartIssue(issue: { productId: string; message: string }) {
  return Object.freeze({
    code: "CART_INVALID",
    productId: issue.productId,
    message: issue.message,
  });
}
