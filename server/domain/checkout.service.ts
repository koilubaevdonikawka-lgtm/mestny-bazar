import type {
  CreateOrderItemRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderStatus,
} from "@shared/contracts/order";
import { OrderStatus as OrderStatusEnum } from "@shared/contracts/order";
import type { IAddressRepository } from "@server/ports/address.repository";
import type { ICheckoutPaymentHandler } from "@server/ports/checkout-payment.port";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import type { CreateOrderData, OrderLineItemInput } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IPaymentPolicy, PaymentPolicyContext } from "@server/ports/payment-policy.port";
import type { IProductRepository } from "@server/ports/product.repository";
import type { ICustomerStatusRepository } from "@server/ports/customer-status.repository";
import { CheckoutValidationError, ProductNotSynchronized } from "@server/domain/checkout.errors";
import { InventoryService } from "@server/domain/inventory.service";
import { OrderService } from "@server/domain/order.service";
import { PricingService } from "@server/domain/pricing.service";
import { sumOrderWeightKg } from "@server/domain/delivery-calculator";
import { CouponService } from "@server/domain/coupon.service";
import { ProductVariantService } from "@server/domain/product-variant.service";
import { VariantStockService } from "@server/domain/variant-stock.service";
import type { ProductVariantDTO } from "@shared/contracts/product-variant";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import { isUuid } from "@server/domain/shared/uuid";
import { logger } from "@shared/observability/logger";

export class CheckoutService {
  constructor(
    private readonly orderService: OrderService,
    private readonly products: IProductRepository,
    private readonly addresses: IAddressRepository,
    private readonly zones: IDeliveryZoneRepository,
    private readonly pricing: PricingService,
    private readonly inventory: InventoryService,
    private readonly checkoutPayment: ICheckoutPaymentHandler,
    private readonly events: IMarketplaceEventBus,
    private readonly paymentPolicy: IPaymentPolicy,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
    private readonly customerStatus: ICustomerStatusRepository,
    private readonly coupons: CouponService,
    /** Stage 18 — existence/ownership/availability checks for a requested variant. Not modified, only composed here. */
    private readonly productVariants: ProductVariantService,
    /** Stage 18 — stock-sufficiency check for a requested variant. Not modified, only composed here. */
    private readonly variantStock: VariantStockService,
  ) {}

  async checkout(userId: string | null, request: CreateOrderRequest): Promise<CreateOrderResponse> {
    this.validateRequest(request, userId);

    // A retried request with the same idempotencyKey must not reserve stock a second
    // time for an order that already exists — short-circuit before touching inventory.
    const existingOrder = await this.orderService.getOrderByIdempotencyKey(request.idempotencyKey);
    if (existingOrder) {
      return { order: existingOrder, paymentUrl: existingOrder.paymentUrl };
    }

    const {
      snapshot: addressSnapshot,
      addressId,
      zoneId: addressZoneId,
    } = await this.resolveAddress(userId, request);
    const zoneId = await this.resolveZoneId(request, addressZoneId);
    const { lineItems, currency, totalWeightKg } = await this.resolveLineItems(request.items);
    const stockItems = lineItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    // Stage 19 — only line items with a variantId reserve variant stock;
    // an order with no variantId anywhere produces an empty array, and
    // variantStock.reserveStock/releaseStock are never called for it below —
    // full behavioral parity with a pre-Stage-19 checkout.
    const variantStockItems = lineItems
      .filter((item): item is OrderLineItemInput & { variantId: string } => !!item.variantId)
      .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));

    // Note: the idempotency short-circuit above and this reservation are not one
    // atomic transaction, so two requests with the same key racing past it
    // simultaneously could both reserve stock before either creates the order —
    // an accepted, narrow-window residual (the request-level idempotency check
    // above closes the far more common sequential-retry case entirely).
    await this.inventory.reserveStock(stockItems);

    // Same reservation step, same principle, for variant stock — if this
    // fails, the product stock just reserved above must be released before
    // rethrowing (mirrors the release-on-error the outer try/catch already
    // does, applied to this narrower window).
    if (variantStockItems.length > 0) {
      try {
        await this.variantStock.reserveStock(variantStockItems);
      } catch (error) {
        await this.inventory.releaseStock(stockItems).catch(() => {
          logger.error(
            "Failed to release reserved product stock after a failed variant stock reservation",
            {
              idempotencyKey: request.idempotencyKey,
              note: "Manual reconciliation may be required.",
            },
          );
        });
        throw error;
      }
    }

    // Everything up to and including createOrder() may still fail for reasons
    // that mean no order was ever persisted (pricing/policy checks, a DB error
    // from create()) — those failures must release the reservation. Once
    // createOrder() returns, a real order + order_items row exists and the
    // reservation is spent against it: releasing stock after that point would
    // desync products.stock from what's actually been sold, for an order that
    // still exists. Only the pre-creation phase is wrapped for release-on-error.
    let order: Awaited<ReturnType<OrderService["createOrder"]>>;
    try {
      const subtotal = this.pricing.calculateSubtotal(
        lineItems.map((item) => ({ price: item.unitPrice, quantity: item.quantity })),
      );

      // Validated and computed server-side, never trusted from the client (CD-01) —
      // marketing.md's DiscountPolicyService, invoked the same way
      // paymentPolicy.assertCanUsePaymentMethod() already validates payment method.
      let discountAmount = 0;
      let appliedCouponId: string | null = null;
      let appliedCouponCode: string | null = null;
      if (request.couponCode) {
        const application = await this.coupons.validateAndApply(request.couponCode, subtotal);
        discountAmount = application.discountAmount;
        appliedCouponId = application.coupon.id;
        appliedCouponCode = application.coupon.code;
      }

      // The only place a delivery fee is computed — DeliveryPricingEngine via
      // PricingService (docs/delivery/delivery-pricing.md) — never duplicated
      // inline here. tariffId/eta are snapshotted onto the order itself so a
      // future Courier Platform can read them without re-deriving (item 9,
      // Промпт №021).
      const deliveryQuote = zoneId
        ? await this.pricing.calculateDeliveryFee(zoneId, subtotal, totalWeightKg)
        : null;
      const deliveryFee = deliveryQuote?.fee ?? 0;
      const total = this.pricing.calculateTotal(subtotal, deliveryFee, discountAmount);
      const isBlocked = userId ? await this.customerStatus.isBlocked(userId) : false;

      this.paymentPolicy.assertCanUsePaymentMethod(
        this.buildPaymentPolicyContext(userId, request, { orderTotal: total, zoneId, isBlocked }),
      );

      const initialStatus = this.resolveInitialStatus(userId, request.idempotencyKey);

      const orderData: CreateOrderData = {
        userId,
        items: lineItems,
        addressId: addressId ?? request.addressId ?? null,
        addressSnapshot,
        zoneId,
        customerName: request.customerName.trim(),
        customerPhone: this.normalizePhone(request.customerPhone),
        paymentMethod: request.paymentMethod,
        notes: request.notes,
        idempotencyKey: request.idempotencyKey,
        status: initialStatus,
        paymentStatus: this.paymentPolicy.getInitialPaymentStatus(request.paymentMethod),
        subtotal,
        deliveryFee,
        deliveryTariffId: deliveryQuote?.tariffId ?? null,
        deliveryEtaMinMinutes: deliveryQuote?.eta.minMinutes ?? null,
        deliveryEtaMaxMinutes: deliveryQuote?.eta.maxMinutes ?? null,
        discountAmount,
        couponCode: appliedCouponCode ?? undefined,
        total,
        currency,
      };

      order = await this.orderService.createOrder(orderData);

      // Only burn a use once an order actually exists — an aborted checkout
      // (a later failure below, or a client that never submits) must not
      // consume the coupon. A redeem failure here must not fail an already
      // successful checkout; it's logged for manual reconciliation instead.
      if (appliedCouponId) {
        await this.coupons.redeemCoupon(appliedCouponId).catch(() => {
          logger.error("Failed to redeem coupon after successful checkout", {
            couponId: appliedCouponId,
            orderId: order.id,
          });
        });
      }
    } catch (error) {
      // Same release-on-error principle as InventoryService, extended to
      // variant stock — by this point both reservations (product, and
      // variant if any) have already succeeded, so both must be released.
      const releases = [
        this.inventory.releaseStock(stockItems).catch(() => {
          logger.error("Failed to release reserved stock after a failed checkout", {
            idempotencyKey: request.idempotencyKey,
            note: "Manual reconciliation may be required.",
          });
        }),
      ];
      if (variantStockItems.length > 0) {
        releases.push(
          this.variantStock.releaseStock(variantStockItems).catch(() => {
            logger.error("Failed to release reserved variant stock after a failed checkout", {
              idempotencyKey: request.idempotencyKey,
              note: "Manual reconciliation may be required.",
            });
          }),
        );
      }
      await Promise.all(releases);
      throw error;
    }

    // preparePayment/publish failures from here on must NOT release stock — the
    // order already exists. They surface as-is to the caller; recovering a
    // created-but-payment-not-prepared order is a distinct concern (retry,
    // ops/admin intervention) from inventory reservation.
    const payment = await this.checkoutPayment.preparePayment(
      request.paymentMethod,
      order,
      request.idempotencyKey,
    );

    const finalOrder: typeof order = {
      ...order,
      paymentStatus: payment.paymentStatus,
      paymentUrl: payment.paymentUrl,
    };

    await this.events.publish({ type: "order.created", order: finalOrder });

    return {
      order: finalOrder,
      paymentUrl: payment.paymentUrl,
    };
  }

  private resolveInitialStatus(userId: string | null, idempotencyKey: string): OrderStatus {
    this.orderLifecycle.assertCanTransition({
      orderId: idempotencyKey,
      currentStatus: OrderStatusEnum.CREATED,
      targetStatus: OrderStatusEnum.CREATED,
      actor: { id: userId },
      reason: "checkout_create",
    });
    return OrderStatusEnum.CREATED;
  }

  private buildPaymentPolicyContext(
    userId: string | null,
    request: CreateOrderRequest,
    extras: Pick<PaymentPolicyContext, "orderTotal" | "zoneId" | "isBlocked">,
  ): PaymentPolicyContext {
    return {
      user: {
        id: userId?.trim() || null,
        roles: [],
      },
      paymentMethod: request.paymentMethod,
      orderTotal: extras.orderTotal,
      zoneId: extras.zoneId,
      isBlocked: extras.isBlocked,
    };
  }

  private validateRequest(request: CreateOrderRequest, userId: string | null): void {
    const details: Record<string, string[]> = {};

    if (!request.idempotencyKey?.trim()) {
      details.idempotencyKey = ["Idempotency key is required"];
    }
    if (!request.items?.length) {
      details.items = ["Cart must contain at least one item"];
    } else {
      for (const [index, item] of request.items.entries()) {
        if (!item.productId?.trim() && !item.productSlug?.trim()) {
          details[`items.${index}.productId`] = ["Product id or slug is required"];
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          details[`items.${index}.quantity`] = ["Quantity must be a positive integer"];
        }
      }
    }
    if (!request.customerName?.trim() || request.customerName.trim().length < 2) {
      details.customerName = ["Customer name must be at least 2 characters"];
    }
    if (this.normalizePhone(request.customerPhone).length < 9) {
      details.customerPhone = ["Customer phone must contain at least 9 digits"];
    }
    if (!request.paymentMethod) {
      details.paymentMethod = ["Payment method is required"];
    }
    if (!userId) {
      if (!request.addressSnapshot?.trim()) {
        details.address = ["Delivery address is required"];
      } else if (request.addressSnapshot.trim().length < 5) {
        details.addressSnapshot = ["Address must be at least 5 characters"];
      }
    } else if (request.addressSnapshot && request.addressSnapshot.trim().length < 5) {
      details.addressSnapshot = ["Address must be at least 5 characters"];
    }

    if (Object.keys(details).length > 0) {
      throw new CheckoutValidationError(details);
    }
  }

  private async resolveAddress(
    userId: string | null,
    request: CreateOrderRequest,
  ): Promise<{ snapshot: string; addressId: string | null; zoneId: string | null }> {
    if (request.addressId) {
      if (!userId) {
        throw new CheckoutValidationError({ addressId: ["Address id requires authentication"] });
      }
      const address = await this.addresses.getById(request.addressId, userId);
      if (!address) {
        throw new CheckoutValidationError({ addressId: ["Address not found"] });
      }
      return { snapshot: address.fullAddress, addressId: address.id, zoneId: address.zoneId };
    }

    if (request.addressSnapshot?.trim()) {
      return { snapshot: request.addressSnapshot.trim(), addressId: null, zoneId: null };
    }

    if (userId) {
      const addresses = await this.addresses.listByUser(userId);
      const defaultAddress = addresses.find((entry) => entry.isDefault);
      if (defaultAddress) {
        return {
          snapshot: defaultAddress.fullAddress,
          addressId: defaultAddress.id,
          zoneId: defaultAddress.zoneId,
        };
      }
      throw new CheckoutValidationError({
        address: ["No default delivery address — add one in your profile"],
      });
    }

    throw new CheckoutValidationError({ address: ["Delivery address is required"] });
  }

  /**
   * addressZoneId comes from the address record resolveAddress() already fetched —
   * this used to re-fetch the same address by id a second time just to read its
   * zoneId, a redundant round trip on every checkout with a saved address.
   */
  private async resolveZoneId(
    request: CreateOrderRequest,
    addressZoneId: string | null,
  ): Promise<string | null> {
    if (request.zoneId) {
      const zone = await this.zones.getById(request.zoneId);
      if (!zone) {
        throw new CheckoutValidationError({ zoneId: ["Delivery zone not found"] });
      }
      return zone.id;
    }

    return addressZoneId;
  }

  /**
   * Batches product lookups into at most two queries (by id, by slug) instead of
   * one round trip per cart line — resolveProduct() used to call getById/getBySlug
   * inside a per-item loop, an N+1 on checkout's hottest path.
   */
  private async resolveLineItems(
    items: CreateOrderItemRequest[],
  ): Promise<{ lineItems: OrderLineItemInput[]; currency: string; totalWeightKg: number }> {
    const ids: string[] = [];
    const slugs: string[] = [];

    for (const item of items) {
      if (item.productId?.trim() && isUuid(item.productId)) {
        ids.push(item.productId.trim());
      } else {
        const slug = item.productSlug?.trim();
        if (!slug) {
          throw new CheckoutValidationError({ items: ["Product slug is required"] });
        }
        slugs.push(slug);
      }
    }

    const [byId, bySlug] = await Promise.all([
      ids.length ? this.products.getManyByIds(ids) : Promise.resolve([]),
      slugs.length ? this.products.getManyBySlugs(slugs) : Promise.resolve([]),
    ]);

    const idMap = new Map(byId.map((product) => [product.id, product]));
    const slugMap = new Map(bySlug.map((product) => [product.slug, product]));

    // Stage 18 — batch-resolve every distinct variantId in the request via
    // the existing ProductVariantService, same N+1-avoidance shape as the
    // product lookup above. Neither ProductVariantService nor
    // VariantStockService exposes a batch-by-ids method (and this stage must
    // not add one — item 1/"не изменять архитектуру вариантов товаров"), so
    // Promise.all over the existing single-item getById() is the closest
    // equivalent without touching either service/port.
    const variantIds = Array.from(
      new Set(items.map((item) => item.variantId?.trim()).filter((id): id is string => !!id)),
    );
    const variantEntries = await Promise.all(
      variantIds.map(async (id) => [id, await this.productVariants.getById(id)] as const),
    );
    const variantMap = new Map(variantEntries);

    const resolved: OrderLineItemInput[] = [];
    const weightInputs: Array<{ weightKg: number | null; quantity: number }> = [];
    let currency: string | undefined;

    for (const item of items) {
      const useId = !!(item.productId?.trim() && isUuid(item.productId));
      const identifier = useId ? item.productId!.trim() : item.productSlug!.trim();
      const product = useId ? idMap.get(identifier) : slugMap.get(identifier);

      if (!product) {
        logger.error("ProductNotSynchronized", {
          identifier,
          identifierType: useId ? "id" : "slug",
          note: useId
            ? "Sync catalog to platform DB before checkout — Checkout must not create products."
            : "Sync catalog so products.slug matches before checkout — Checkout must not create products.",
        });
        throw new ProductNotSynchronized(identifier);
      }
      if (!product.inStock) {
        throw new CheckoutValidationError({
          items: [`Product out of stock: ${product.name}`],
        });
      }

      const variantId = item.variantId?.trim() || null;
      if (variantId) {
        this.assertVariantMatchesProduct(variantId, product.id, variantMap.get(variantId));
      }

      currency ??= product.currency;
      weightInputs.push({ weightKg: product.weightKg, quantity: item.quantity });
      resolved.push({
        productId: product.id,
        variantId,
        productName: product.name,
        productImageUrl: product.imageUrl,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      });
    }

    // Stage 18 — stock-sufficiency check via the existing VariantStockService,
    // only for line items that already passed the existence/ownership/
    // availability check above. getByVariantId() returning null means stock
    // is not yet tracked for that variant (opt-in tracking, Stage 14) — not
    // a failure, just "no stock constraint applies yet". This is a read-only
    // check: no reservation/deduction is performed here (item 5 — a future
    // stage's job, using this same VariantStockService unmodified).
    const stockChecks: Promise<void>[] = [];
    for (const item of resolved) {
      if (item.variantId) {
        stockChecks.push(this.assertVariantStockAvailable(item.variantId, item.quantity));
      }
    }
    await Promise.all(stockChecks);

    return {
      lineItems: resolved,
      currency: currency ?? "KGS",
      totalWeightKg: sumOrderWeightKg(weightInputs),
    };
  }

  /**
   * Existence, product-ownership, and availability — mirrors item 2's list
   * ("существует ли / принадлежит ли / доступен ли / не архивирован ли / не
   * удалён ли"). ProductVariantDTO has no separate archived/deleted flag
   * (Stage 13 never added one): a null getById() result already means
   * "doesn't exist" (covers "удалён"), and publicationStatus !== PUBLISHED
   * covers both "not available" and "archived" (HIDDEN is the existing
   * analog — same field the parent product itself already uses).
   */
  private assertVariantMatchesProduct(
    variantId: string,
    productId: string,
    variant: ProductVariantDTO | null | undefined,
  ): void {
    if (!variant) {
      throw new CheckoutValidationError({ items: [`Product variant not found: ${variantId}`] });
    }
    if (variant.productId !== productId) {
      throw new CheckoutValidationError({
        items: [`Product variant does not belong to the requested product: ${variantId}`],
      });
    }
    if (variant.publicationStatus !== "PUBLISHED") {
      throw new CheckoutValidationError({
        items: [`Product variant is not available: ${variantId}`],
      });
    }
  }

  private async assertVariantStockAvailable(variantId: string, quantity: number): Promise<void> {
    const stock = await this.variantStock.getByVariantId(variantId);
    if (stock && stock.stock < quantity) {
      throw new CheckoutValidationError({
        items: [`Insufficient stock for variant: ${variantId}`],
      });
    }
  }

  private normalizePhone(raw: string): string {
    return raw.replace(/[^\d]/g, "");
  }
}
