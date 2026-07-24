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
import { CheckoutValidationError, ProductNotSynchronized } from "@server/domain/checkout.errors";
import { InventoryService } from "@server/domain/inventory.service";
import { OrderService } from "@server/domain/order.service";
import { PricingService } from "@server/domain/pricing.service";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import { isUuid } from "@server/domain/shared/uuid";

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
  ) {}

  async checkout(userId: string | null, request: CreateOrderRequest): Promise<CreateOrderResponse> {
    this.validateRequest(request, userId);

    const { snapshot: addressSnapshot, addressId } = await this.resolveAddress(userId, request);
    const zoneId = await this.resolveZoneId(userId, request, addressId);
    const lineItems = await this.resolveLineItems(request.items);

    await this.inventory.validateStock(
      lineItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    );

    const subtotal = this.pricing.calculateSubtotal(
      lineItems.map((item) => ({ price: item.unitPrice, quantity: item.quantity })),
    );

    const deliveryFee = zoneId
      ? (await this.pricing.calculateDeliveryFee(zoneId, subtotal)).fee
      : 0;
    const total = this.pricing.calculateTotal(subtotal, deliveryFee);
    const currency = lineItems[0] ? await this.resolveCurrency(lineItems[0].productId) : "KGS";

    this.paymentPolicy.assertCanUsePaymentMethod(
      this.buildPaymentPolicyContext(userId, request, { orderTotal: total, zoneId }),
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
      total,
      currency,
    };

    const order = await this.orderService.createOrder(orderData);

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
    extras: Pick<PaymentPolicyContext, "orderTotal" | "zoneId">,
  ): PaymentPolicyContext {
    return {
      user: {
        id: userId?.trim() || null,
        roles: [],
      },
      paymentMethod: request.paymentMethod,
      orderTotal: extras.orderTotal,
      zoneId: extras.zoneId,
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
  ): Promise<{ snapshot: string; addressId: string | null }> {
    if (request.addressId) {
      if (!userId) {
        throw new CheckoutValidationError({ addressId: ["Address id requires authentication"] });
      }
      const address = await this.addresses.getById(request.addressId, userId);
      if (!address) {
        throw new CheckoutValidationError({ addressId: ["Address not found"] });
      }
      return { snapshot: address.fullAddress, addressId: address.id };
    }

    if (request.addressSnapshot?.trim()) {
      return { snapshot: request.addressSnapshot.trim(), addressId: null };
    }

    if (userId) {
      const addresses = await this.addresses.listByUser(userId);
      const defaultAddress = addresses.find((entry) => entry.isDefault);
      if (defaultAddress) {
        return { snapshot: defaultAddress.fullAddress, addressId: defaultAddress.id };
      }
      throw new CheckoutValidationError({
        address: ["No default delivery address — add one in your profile"],
      });
    }

    throw new CheckoutValidationError({ address: ["Delivery address is required"] });
  }

  private async resolveZoneId(
    userId: string | null,
    request: CreateOrderRequest,
    resolvedAddressId: string | null,
  ): Promise<string | null> {
    if (request.zoneId) {
      const zone = await this.zones.getById(request.zoneId);
      if (!zone) {
        throw new CheckoutValidationError({ zoneId: ["Delivery zone not found"] });
      }
      return zone.id;
    }

    const effectiveAddressId = resolvedAddressId ?? request.addressId ?? null;
    if (effectiveAddressId && userId) {
      const address = await this.addresses.getById(effectiveAddressId, userId);
      return address?.zoneId ?? null;
    }

    return null;
  }

  private async resolveLineItems(items: CreateOrderItemRequest[]): Promise<OrderLineItemInput[]> {
    const resolved: OrderLineItemInput[] = [];

    for (const item of items) {
      const product = await this.resolveProduct(item);
      if (!product.inStock) {
        throw new CheckoutValidationError({
          items: [`Product out of stock: ${product.name}`],
        });
      }

      const unitPrice = product.price;
      resolved.push({
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      });
    }

    return resolved;
  }

  private async resolveProduct(item: CreateOrderItemRequest) {
    if (item.productId?.trim() && isUuid(item.productId)) {
      const product = await this.products.getById(item.productId);
      if (!product) {
        console.error(
          `[Checkout] ProductNotSynchronized: product id "${item.productId}" is not in Supabase. ` +
            "Sync catalog to platform DB before checkout — Checkout must not create products.",
        );
        throw new ProductNotSynchronized(item.productId);
      }
      return product;
    }

    const slug = item.productSlug?.trim();
    if (!slug) {
      throw new CheckoutValidationError({ items: ["Product slug is required"] });
    }

    const product = await this.products.getBySlug(slug);
    if (!product) {
      console.error(
        `[Checkout] ProductNotSynchronized: slug "${slug}" is not in Supabase. ` +
          "Map Shopify handle → products.slug and sync catalog before checkout — Checkout must not create products.",
      );
      throw new ProductNotSynchronized(slug);
    }
    return product;
  }

  private async resolveCurrency(productId: string): Promise<string> {
    const product = await this.products.getById(productId);
    return product?.currency ?? "KGS";
  }

  private normalizePhone(raw: string): string {
    return raw.replace(/[^\d]/g, "");
  }
}
