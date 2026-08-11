import { describe, expect, it, vi } from "vitest";
import { CheckoutService } from "@server/domain/checkout.service";
import { OrderService } from "@server/domain/order.service";
import { PricingService } from "@server/domain/pricing.service";
import { InventoryService } from "@server/domain/inventory.service";
import { CouponService } from "@server/domain/coupon.service";
import { DiscountPolicyService } from "@server/domain/discount-policy/discount-policy.service";
import { CouponValidityRule } from "@server/domain/discount-policy/rules/coupon-validity.rule";
import { CouponMinOrderRule } from "@server/domain/discount-policy/rules/coupon-min-order.rule";
import { CouponDiscountAmountRule } from "@server/domain/discount-policy/rules/coupon-discount-amount.rule";
import { InsufficientStockError } from "@server/domain/checkout.errors";
import { ProductVariantService } from "@server/domain/product-variant.service";
import { VariantStockService } from "@server/domain/variant-stock.service";
import type { CreateOrderData, IOrderRepository } from "@server/ports/order.repository";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import type { IAddressRepository } from "@server/ports/address.repository";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import type { IDeliveryPricingEngine } from "@server/ports/delivery-pricing-engine.port";
import type { ICheckoutPaymentHandler } from "@server/ports/checkout-payment.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { IPaymentPolicy, PaymentPolicyContext } from "@server/ports/payment-policy.port";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { ICustomerStatusRepository } from "@server/ports/customer-status.repository";
import type { ICouponRepository } from "@server/ports/coupon.repository";
import type { IProductVariantRepository } from "@server/ports/product-variant.repository";
import type {
  IVariantStockRepository,
  VariantStockRow,
} from "@server/ports/variant-stock.repository";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import type { IStockPolicy, StockPolicyResult } from "@server/ports/stock-policy.port";
import type { CreateOrderRequest, OrderDTO } from "@shared/contracts/order";
import type { ProductDTO } from "@shared/contracts/catalog";
import type { CouponDTO } from "@shared/contracts/coupon";
import type { ProductVariantDTO } from "@shared/contracts/product-variant";

const PRODUCT_ID = "11111111-1111-1111-1111-111111111111";

function makeProduct(overrides: Partial<ProductDTO> = {}): ProductDTO {
  return {
    id: PRODUCT_ID,
    name: "Test Product",
    slug: "test-product",
    description: null,
    price: 100,
    currency: "KGS",
    unit: null,
    imageUrl: null,
    imageUrls: [],
    stock: 10,
    inStock: true,
    categoryId: null,
    manufacturer: null,
    countryOfOrigin: null,
    ...overrides,
  };
}

function makeOrderDTO(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: "CREATED",
    paymentStatus: "unpaid",
    paymentMethod: "ONLINE",
    subtotal: 100,
    deliveryFee: 0,
    discountAmount: 0,
    couponCode: null,
    total: 100,
    currency: "KGS",
    customerName: "Test Buyer",
    customerPhone: "996700000000",
    addressSnapshot: "Test address",
    notes: null,
    paymentUrl: null,
    items: [],
    createdAt: new Date().toISOString(),
    paidAt: null,
    assignedCourierId: null,
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
    ...overrides,
  };
}

function makeRequest(overrides: Partial<CreateOrderRequest> = {}): CreateOrderRequest {
  return {
    items: [{ productId: PRODUCT_ID, quantity: 2 }],
    addressSnapshot: "г. Кант, ул. Ленина 12",
    customerName: "Test Buyer",
    customerPhone: "996700000000",
    paymentMethod: "ONLINE",
    idempotencyKey: "idem-key-1",
    ...overrides,
  };
}

function fakeOrderRepository(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    create: vi.fn(async (data: CreateOrderData) =>
      makeOrderDTO({
        status: data.status,
        paymentStatus: data.paymentStatus,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: data.total,
        currency: data.currency,
      }),
    ),
    getById: vi.fn(async () => null),
    getByIdempotencyKey: vi.fn(async () => null),
    listByUser: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    listByStatuses: vi.fn(async () => []),
    updateStatus: vi.fn(async () => makeOrderDTO()),
    updatePaymentStatus: vi.fn(async () => makeOrderDTO()),
    countByStatuses: vi.fn(async () => 0),
    getTodaySummary: vi.fn(async () => ({ orderCount: 0, revenue: 0 })),

    assignCourier: vi.fn(async (_id, courierId) => makeOrderDTO({ assignedCourierId: courierId })),

    countActiveDeliveriesByCourier: vi.fn(async () => 0),

    listByStatusesForCourier: vi.fn(async () => []),
    listByCourier: vi.fn(async () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    })),
    listInPeriod: vi.fn(async () => []),
    ...overrides,
  };
}

function fakeProductRepository(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    getBySlug: vi.fn(async () => makeProduct()),
    getById: vi.fn(async () => makeProduct()),
    getManyByIds: vi.fn(async (ids: string[]) => (ids.includes(PRODUCT_ID) ? [makeProduct()] : [])),
    getManyBySlugs: vi.fn(async () => []),
    checkStock: vi.fn(async () => true),
    reserveStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    releaseStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    increaseStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    ...overrides,
  };
}

function fakeAddressRepository(overrides: Partial<IAddressRepository> = {}): IAddressRepository {
  return {
    listByUser: vi.fn(async () => []),
    getById: vi.fn(async () => null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as IAddressRepository;
}

function fakeZoneRepository(
  overrides: Partial<IDeliveryZoneRepository> = {},
): IDeliveryZoneRepository {
  return {
    listActive: vi.fn(async () => []),
    getById: vi.fn(async () => null),
    ...overrides,
  };
}

function fakeDeliveryPricingEngine(
  overrides: Partial<IDeliveryPricingEngine> = {},
): IDeliveryPricingEngine {
  return {
    calculate: vi.fn(async () => ({
      zoneId: "zone-1",
      zoneName: "Zone",
      tariffId: "tariff-1",
      tariffName: "Standard",
      fee: 0,
      freeFrom: null,
      subtotal: 0,
      isFree: true,
      eta: { minMinutes: null, maxMinutes: null },
    })),
    ...overrides,
  };
}

function fakePaymentHandler(
  overrides: Partial<ICheckoutPaymentHandler> = {},
): ICheckoutPaymentHandler {
  return {
    preparePayment: vi.fn(async () => ({ paymentUrl: null, paymentStatus: "awaiting" as const })),
    ...overrides,
  };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

function fakePaymentPolicy(overrides: Partial<IPaymentPolicy> = {}): IPaymentPolicy {
  return {
    canUsePaymentMethod: vi.fn(() => ({ allowed: true })),
    assertCanUsePaymentMethod: vi.fn((_context: PaymentPolicyContext) => {}),
    getInitialPaymentStatus: vi.fn(() => "awaiting" as const),
    ...overrides,
  };
}

function fakeOrderLifecycle(overrides: Partial<IOrderLifecyclePolicy> = {}): IOrderLifecyclePolicy {
  return {
    canTransition: vi.fn(() => ({ allowed: true })),
    assertCanTransition: vi.fn(() => {}),
    ...overrides,
  };
}

function fakeCustomerStatusRepository(
  overrides: Partial<ICustomerStatusRepository> = {},
): ICustomerStatusRepository {
  return { isBlocked: vi.fn(async () => false), ...overrides };
}

function fakeCouponRepository(overrides: Partial<ICouponRepository> = {}): ICouponRepository {
  return {
    listAll: vi.fn(async () => []),
    getById: vi.fn(async () => null),
    getByCode: vi.fn(async () => null),
    create: vi.fn(async (data) => ({ ...data, id: "coupon-1", usesCount: 0 }) as CouponDTO),
    update: vi.fn(async () => {
      throw new Error("not implemented in fake");
    }),
    incrementUsesCount: vi.fn(async () => {}),
    ...overrides,
  };
}

const VARIANT_ID = "22222222-2222-2222-2222-222222222222";

function makeVariant(overrides: Partial<ProductVariantDTO> = {}): ProductVariantDTO {
  return {
    id: VARIANT_ID,
    productId: PRODUCT_ID,
    sku: "SKU-VARIANT-1",
    price: null,
    imageUrl: null,
    publicationStatus: "PUBLISHED",
    sortOrder: 0,
    ...overrides,
  };
}

function fakeProductVariantRepository(
  overrides: Partial<IProductVariantRepository> = {},
): IProductVariantRepository {
  return {
    listForProduct: vi.fn(async () => []),
    getById: vi.fn(async (id: string) => (id === VARIANT_ID ? makeVariant() : null)),
    create: vi.fn(async () => makeVariant()),
    update: vi.fn(async () => makeVariant()),
    skuExists: vi.fn(async () => false),
    ...overrides,
  };
}

function fakeVariantStockRepository(
  overrides: Partial<IVariantStockRepository> = {},
): IVariantStockRepository {
  return {
    listForProduct: vi.fn(async () => []),
    getByVariantId: vi.fn(async () => null),
    create: vi.fn(async (variantId: string, stock: number, lowStockThreshold: number | null) => ({
      variantId,
      stock,
      lowStockThreshold,
    })),
    adjustStock: vi.fn(async (variantId: string, stock: number) => ({
      variantId,
      stock,
      lowStockThreshold: null,
    })),
    setLowStockThreshold: vi.fn(
      async (variantId: string, threshold: number | null): Promise<VariantStockRow> => ({
        variantId,
        stock: 0,
        lowStockThreshold: threshold,
      }),
    ),
    reserveStock: vi.fn(async () => {}),
    releaseStock: vi.fn(async () => {}),
    ...overrides,
  };
}

function fakeSellerProductRepository(
  overrides: Partial<ISellerProductRepository> = {},
): ISellerProductRepository {
  return {
    listBySeller: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false })),
    getById: vi.fn(async () => null),
    create: vi.fn(),
    update: vi.fn(),
    setPublicationStatus: vi.fn(),
    slugExists: vi.fn(async () => false),
    ...overrides,
  } as ISellerProductRepository;
}

function fakeStockPolicy(overrides: Partial<IStockPolicy> = {}): IStockPolicy {
  const evaluateStock = vi.fn((): StockPolicyResult => ({ allowed: true, effectiveThreshold: 5 }));
  return { evaluateStock, assertStockOk: vi.fn(), ...overrides };
}

function buildCheckoutService(deps: {
  orderRepo?: IOrderRepository;
  productRepo?: IProductRepository;
  addressRepo?: IAddressRepository;
  zoneRepo?: IDeliveryZoneRepository;
  deliveryPricingEngine?: IDeliveryPricingEngine;
  paymentHandler?: ICheckoutPaymentHandler;
  eventBus?: IMarketplaceEventBus;
  paymentPolicy?: IPaymentPolicy;
  orderLifecycle?: IOrderLifecyclePolicy;
  customerStatus?: ICustomerStatusRepository;
  couponRepo?: ICouponRepository;
  productVariantRepo?: IProductVariantRepository;
  variantStockRepo?: IVariantStockRepository;
}) {
  const orderRepo = deps.orderRepo ?? fakeOrderRepository();
  const productRepo = deps.productRepo ?? fakeProductRepository();
  const orderLifecycle = deps.orderLifecycle ?? fakeOrderLifecycle();
  const eventBus = deps.eventBus ?? fakeEventBus();

  const pricing = new PricingService(deps.deliveryPricingEngine ?? fakeDeliveryPricingEngine());
  const inventory = new InventoryService(productRepo);
  const orderService = new OrderService(orderRepo, orderLifecycle, inventory, eventBus);
  const discountPolicy = new DiscountPolicyService([
    new CouponValidityRule(),
    new CouponMinOrderRule(),
    new CouponDiscountAmountRule(),
  ]);
  const coupons = new CouponService(
    deps.couponRepo ?? fakeCouponRepository(),
    discountPolicy,
    eventBus,
  );

  const productVariantRepo = deps.productVariantRepo ?? fakeProductVariantRepository();
  const variantStockRepo = deps.variantStockRepo ?? fakeVariantStockRepository();
  const productVariants = new ProductVariantService(
    productVariantRepo,
    fakeSellerProductRepository(),
  );
  const variantStock = new VariantStockService(
    variantStockRepo,
    productVariantRepo,
    fakeStockPolicy(),
  );

  const checkout = new CheckoutService(
    orderService,
    productRepo,
    deps.addressRepo ?? fakeAddressRepository(),
    deps.zoneRepo ?? fakeZoneRepository(),
    pricing,
    inventory,
    deps.paymentHandler ?? fakePaymentHandler(),
    eventBus,
    deps.paymentPolicy ?? fakePaymentPolicy(),
    orderLifecycle,
    deps.customerStatus ?? fakeCustomerStatusRepository(),
    coupons,
    productVariants,
    variantStock,
  );

  return { checkout, orderRepo, productRepo, productVariantRepo, variantStockRepo };
}

describe("CheckoutService.checkout", () => {
  it("short-circuits on a repeated idempotencyKey without reserving stock or creating an order", async () => {
    const existing = makeOrderDTO({ id: "existing-order" });
    const orderRepo = fakeOrderRepository({
      getByIdempotencyKey: vi.fn(async () => existing),
    });
    const productRepo = fakeProductRepository();
    const { checkout } = buildCheckoutService({ orderRepo, productRepo });

    const result = await checkout.checkout(null, makeRequest());

    expect(result.order).toBe(existing);
    expect(productRepo.reserveStock).not.toHaveBeenCalled();
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("rejects checkout for a blocked authenticated customer (users.md)", async () => {
    const customerStatus = fakeCustomerStatusRepository({ isBlocked: vi.fn(async () => true) });
    const paymentPolicy = fakePaymentPolicy({
      assertCanUsePaymentMethod: vi.fn((context: PaymentPolicyContext) => {
        if (context.isBlocked) throw new Error("USER_BLOCKED");
      }),
    });
    const { checkout } = buildCheckoutService({ customerStatus, paymentPolicy });

    await expect(checkout.checkout("blocked-user", makeRequest())).rejects.toThrow("USER_BLOCKED");
    expect(customerStatus.isBlocked).toHaveBeenCalledWith("blocked-user");
  });

  it("never checks block status for a guest checkout", async () => {
    const customerStatus = fakeCustomerStatusRepository();
    const { checkout } = buildCheckoutService({ customerStatus });

    await checkout.checkout(null, makeRequest());

    expect(customerStatus.isBlocked).not.toHaveBeenCalled();
  });

  it("reserves stock, creates the order, prepares payment, and publishes an event on the happy path", async () => {
    const eventBus = fakeEventBus();
    const paymentHandler = fakePaymentHandler({
      preparePayment: vi.fn(async () => ({
        paymentUrl: "https://pay.example/abc",
        paymentStatus: "awaiting" as const,
      })),
    });
    const { checkout, orderRepo, productRepo } = buildCheckoutService({ eventBus, paymentHandler });

    const result = await checkout.checkout(null, makeRequest());

    expect(productRepo.reserveStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 2 }]);
    expect(orderRepo.create).toHaveBeenCalledTimes(1);
    expect(paymentHandler.preparePayment).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order.created" }),
    );
    expect(result.paymentUrl).toBe("https://pay.example/abc");
    expect(productRepo.releaseStock).not.toHaveBeenCalled();
  });

  it("applies a valid coupon: reduces the total, persists the discount, and redeems it after order creation", async () => {
    const coupon: CouponDTO = {
      id: "coupon-1",
      code: "SAVE10",
      discountType: "FIXED",
      discountValue: 20,
      minOrderTotal: 0,
      maxUses: null,
      usesCount: 0,
      expiresAt: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const couponRepo = fakeCouponRepository({
      getByCode: vi.fn(async () => coupon),
      getById: vi.fn(async () => coupon),
    });
    const orderRepo = fakeOrderRepository();
    const eventBus = fakeEventBus();
    const { checkout } = buildCheckoutService({ couponRepo, orderRepo, eventBus });

    await checkout.checkout(null, makeRequest({ couponCode: "save10" }));

    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ discountAmount: 20, couponCode: "SAVE10", total: 180 }),
    );
    expect(couponRepo.incrementUsesCount).toHaveBeenCalledWith("coupon-1");
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "coupon.redeemed" }),
    );
  });

  it("rejects checkout with an unknown coupon code and releases reserved stock", async () => {
    const couponRepo = fakeCouponRepository({ getByCode: vi.fn(async () => null) });
    const { checkout, orderRepo, productRepo } = buildCheckoutService({ couponRepo });

    await expect(checkout.checkout(null, makeRequest({ couponCode: "MISSING" }))).rejects.toThrow();
    expect(orderRepo.create).not.toHaveBeenCalled();
    expect(productRepo.releaseStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 2 }]);
  });

  it("propagates InsufficientStockError and never attempts to create an order", async () => {
    const productRepo = fakeProductRepository({
      reserveStock: vi.fn(async () => {
        throw new InsufficientStockError(PRODUCT_ID);
      }),
    });
    const { checkout, orderRepo } = buildCheckoutService({ productRepo });

    await expect(checkout.checkout(null, makeRequest())).rejects.toBeInstanceOf(
      InsufficientStockError,
    );
    expect(orderRepo.create).not.toHaveBeenCalled();
    // Reservation itself failed — nothing was reserved, so there is nothing to release.
    expect(productRepo.releaseStock).not.toHaveBeenCalled();
  });

  it("releases reserved stock when a later step fails (e.g. payment policy denial)", async () => {
    const denialError = new Error("payment method denied");
    const paymentPolicy = fakePaymentPolicy({
      assertCanUsePaymentMethod: vi.fn(() => {
        throw denialError;
      }),
    });
    const { checkout, orderRepo, productRepo } = buildCheckoutService({ paymentPolicy });

    await expect(checkout.checkout(null, makeRequest())).rejects.toBe(denialError);

    expect(productRepo.reserveStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 2 }]);
    expect(productRepo.releaseStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 2 }]);
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("does not release stock when a failure happens after the order was already created", async () => {
    const paymentError = new Error("payment provider unreachable");
    const paymentHandler = fakePaymentHandler({
      preparePayment: vi.fn(async () => {
        throw paymentError;
      }),
    });
    const { checkout, orderRepo, productRepo } = buildCheckoutService({ paymentHandler });

    await expect(checkout.checkout(null, makeRequest())).rejects.toBe(paymentError);

    expect(orderRepo.create).toHaveBeenCalledTimes(1);
    // The order was already persisted — releasing stock here would desync
    // products.stock from an order that still exists.
    expect(productRepo.releaseStock).not.toHaveBeenCalled();
  });

  it("fetches a request-supplied address only once and derives its zone from that same fetch", async () => {
    const address = {
      id: "address-1",
      label: null,
      fullAddress: "г. Бишкек, ул. Абая 10",
      city: null,
      district: null,
      notes: null,
      zoneId: "zone-9",
      isDefault: false,
    };
    const addressRepo = fakeAddressRepository({ getById: vi.fn(async () => address) });
    const { checkout } = buildCheckoutService({ addressRepo });

    await checkout.checkout("user-1", makeRequest({ addressId: "address-1" }));

    expect(addressRepo.getById).toHaveBeenCalledTimes(1);
    expect(addressRepo.getById).toHaveBeenCalledWith("address-1", "user-1");
  });

  it("rejects an incomplete request before touching any dependency", async () => {
    const { checkout, orderRepo, productRepo } = buildCheckoutService({});

    await expect(checkout.checkout(null, makeRequest({ customerName: "" }))).rejects.toMatchObject({
      name: "CheckoutValidationError",
    });

    expect(orderRepo.getByIdempotencyKey).not.toHaveBeenCalled();
    expect(productRepo.reserveStock).not.toHaveBeenCalled();
  });
});

describe("CheckoutService.checkout — request validation", () => {
  async function expectValidationDetail(
    overrides: Partial<CreateOrderRequest>,
    detailKey: string,
    userId: string | null = null,
  ) {
    const { checkout } = buildCheckoutService({});
    try {
      await checkout.checkout(userId, makeRequest(overrides));
      expect.fail("expected CheckoutValidationError to be thrown");
    } catch (error) {
      expect(error).toMatchObject({ name: "CheckoutValidationError" });
      expect(Object.keys((error as { details: Record<string, string[]> }).details)).toContain(
        detailKey,
      );
    }
  }

  it("rejects a blank idempotencyKey", async () => {
    await expectValidationDetail({ idempotencyKey: "  " }, "idempotencyKey");
  });

  it("rejects an empty items array", async () => {
    await expectValidationDetail({ items: [] }, "items");
  });

  it("rejects a line item with neither productId nor productSlug", async () => {
    await expectValidationDetail({ items: [{ quantity: 1 }] }, "items.0.productId");
  });

  it("rejects a line item with a non-positive quantity", async () => {
    await expectValidationDetail(
      { items: [{ productId: PRODUCT_ID, quantity: 0 }] },
      "items.0.quantity",
    );
  });

  it("rejects a customer name under 2 characters", async () => {
    await expectValidationDetail({ customerName: "A" }, "customerName");
  });

  it("rejects a phone number with fewer than 9 digits", async () => {
    await expectValidationDetail({ customerPhone: "12345" }, "customerPhone");
  });

  it("rejects a missing payment method", async () => {
    await expectValidationDetail(
      { paymentMethod: undefined as unknown as CreateOrderRequest["paymentMethod"] },
      "paymentMethod",
    );
  });

  it("rejects a guest checkout with no address snapshot", async () => {
    await expectValidationDetail({ addressSnapshot: undefined }, "address", null);
  });

  it("rejects a guest checkout with an address snapshot under 5 characters", async () => {
    await expectValidationDetail({ addressSnapshot: "abc" }, "addressSnapshot", null);
  });

  it("rejects an authenticated checkout whose supplied address snapshot is under 5 characters", async () => {
    await expectValidationDetail({ addressSnapshot: "abc" }, "addressSnapshot", "user-1");
  });
});

describe("CheckoutService.checkout — address resolution", () => {
  const address = {
    id: "address-1",
    label: null,
    fullAddress: "г. Бишкек, ул. Абая 10",
    city: null,
    district: null,
    notes: null,
    zoneId: "zone-9",
    isDefault: false,
  };

  it("rejects addressId when the caller is a guest", async () => {
    const { checkout } = buildCheckoutService({});
    await expect(
      checkout.checkout(null, makeRequest({ addressId: "address-1" })),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
  });

  it("rejects addressId when the address does not belong to (or exist for) the user", async () => {
    const addressRepo = fakeAddressRepository({ getById: vi.fn(async () => null) });
    const { checkout } = buildCheckoutService({ addressRepo });

    await expect(
      checkout.checkout("user-1", makeRequest({ addressId: "missing" })),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
  });

  it("falls back to the user's default saved address when none is specified", async () => {
    const addressRepo = fakeAddressRepository({
      listByUser: vi.fn(async () => [
        { ...address, id: "not-default", isDefault: false },
        { ...address, id: "default-one", isDefault: true },
      ]),
    });
    const orderRepo = fakeOrderRepository();
    const { checkout } = buildCheckoutService({ addressRepo, orderRepo });

    await checkout.checkout("user-1", makeRequest({ addressSnapshot: undefined }));

    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ addressId: "default-one" }),
    );
  });

  it("rejects an authenticated checkout with no addressId/snapshot and no default address on file", async () => {
    const addressRepo = fakeAddressRepository({ listByUser: vi.fn(async () => []) });
    const { checkout } = buildCheckoutService({ addressRepo });

    await expect(
      checkout.checkout("user-1", makeRequest({ addressSnapshot: undefined })),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
  });
});

describe("CheckoutService.checkout — delivery zone resolution", () => {
  it("rejects an explicit zoneId that does not exist", async () => {
    const zoneRepo = fakeZoneRepository({ getById: vi.fn(async () => null) });
    const { checkout } = buildCheckoutService({ zoneRepo });

    await expect(
      checkout.checkout(null, makeRequest({ zoneId: "missing-zone" })),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
  });

  it("uses the resolved zone id when an explicit zoneId is valid", async () => {
    const zoneRepo = fakeZoneRepository({
      getById: vi.fn(async (id: string) => ({
        id,
        cityId: "city-1",
        storeId: null,
        name: "Zone",
        sortOrder: 0,
        isActive: true,
      })),
    });
    const orderRepo = fakeOrderRepository();
    const { checkout } = buildCheckoutService({ zoneRepo, orderRepo });

    await checkout.checkout(null, makeRequest({ zoneId: "zone-42" }));

    expect(orderRepo.create).toHaveBeenCalledWith(expect.objectContaining({ zoneId: "zone-42" }));
  });
});

describe("CheckoutService.checkout — line item resolution", () => {
  it("resolves a line item by productSlug when no productId is given", async () => {
    const productRepo = fakeProductRepository({
      getManyByIds: vi.fn(async () => []),
      getManyBySlugs: vi.fn(async (slugs: string[]) =>
        slugs.includes("test-product") ? [makeProduct()] : [],
      ),
    });
    const { checkout } = buildCheckoutService({ productRepo });

    const result = await checkout.checkout(
      null,
      makeRequest({ items: [{ productSlug: "test-product", quantity: 1 }] }),
    );

    expect(productRepo.getManyBySlugs).toHaveBeenCalledWith(["test-product"]);
    expect(result.order.total).toBeGreaterThan(0);
  });

  it("rejects a line item with neither a real productId nor a productSlug fallback", async () => {
    const { checkout } = buildCheckoutService({});

    await expect(
      checkout.checkout(null, makeRequest({ items: [{ productId: "not-a-uuid", quantity: 1 }] })),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
  });

  it("throws ProductNotSynchronized when the product id isn't in the platform catalog", async () => {
    const productRepo = fakeProductRepository({ getManyByIds: vi.fn(async () => []) });
    const { checkout } = buildCheckoutService({ productRepo });

    await expect(checkout.checkout(null, makeRequest())).rejects.toMatchObject({
      name: "ProductNotSynchronized",
    });
  });

  it("rejects a product that is out of stock", async () => {
    const productRepo = fakeProductRepository({
      getManyByIds: vi.fn(async () => [makeProduct({ inStock: false })]),
    });
    const { checkout } = buildCheckoutService({ productRepo });

    await expect(checkout.checkout(null, makeRequest())).rejects.toMatchObject({
      name: "CheckoutValidationError",
    });
  });
});

describe("CheckoutService.checkout — variantId (Stage 18)", () => {
  it("checks out normally with no variantId — full backward compatibility", async () => {
    const productVariantRepo = fakeProductVariantRepository();
    const { checkout, orderRepo } = buildCheckoutService({ productVariantRepo });

    const result = await checkout.checkout(null, makeRequest());

    expect(result.order.total).toBeGreaterThan(0);
    expect(productVariantRepo.getById).not.toHaveBeenCalled();
    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ items: [expect.objectContaining({ variantId: null })] }),
    );
  });

  it("persists variantId on the order line when the variant exists, matches the product, and is published", async () => {
    const variantStockRepo = fakeVariantStockRepository({
      getByVariantId: vi.fn(async () => ({
        variantId: VARIANT_ID,
        stock: 10,
        lowStockThreshold: null,
      })),
    });
    const { checkout, orderRepo } = buildCheckoutService({ variantStockRepo });

    await checkout.checkout(
      null,
      makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 2 }] }),
    );

    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ productId: PRODUCT_ID, variantId: VARIANT_ID })],
      }),
    );
  });

  it("rejects an unknown variantId", async () => {
    const productVariantRepo = fakeProductVariantRepository({ getById: vi.fn(async () => null) });
    const { checkout, orderRepo } = buildCheckoutService({ productVariantRepo });

    await expect(
      checkout.checkout(
        null,
        makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 1 }] }),
      ),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("rejects a variant that belongs to a different product", async () => {
    const productVariantRepo = fakeProductVariantRepository({
      getById: vi.fn(async () => makeVariant({ productId: "some-other-product" })),
    });
    const { checkout, orderRepo } = buildCheckoutService({ productVariantRepo });

    await expect(
      checkout.checkout(
        null,
        makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 1 }] }),
      ),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("rejects a DRAFT (unpublished) variant", async () => {
    const productVariantRepo = fakeProductVariantRepository({
      getById: vi.fn(async () => makeVariant({ publicationStatus: "DRAFT" })),
    });
    const { checkout, orderRepo } = buildCheckoutService({ productVariantRepo });

    await expect(
      checkout.checkout(
        null,
        makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 1 }] }),
      ),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("rejects a HIDDEN (archived) variant", async () => {
    const productVariantRepo = fakeProductVariantRepository({
      getById: vi.fn(async () => makeVariant({ publicationStatus: "HIDDEN" })),
    });
    const { checkout, orderRepo } = buildCheckoutService({ productVariantRepo });

    await expect(
      checkout.checkout(
        null,
        makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 1 }] }),
      ),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("rejects a variant with insufficient tracked stock (VariantStockService, not products.stock)", async () => {
    const variantStockRepo = fakeVariantStockRepository({
      getByVariantId: vi.fn(async () => ({
        variantId: VARIANT_ID,
        stock: 1,
        lowStockThreshold: null,
      })),
    });
    const { checkout, orderRepo } = buildCheckoutService({ variantStockRepo });

    await expect(
      checkout.checkout(
        null,
        makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 5 }] }),
      ),
    ).rejects.toMatchObject({ name: "CheckoutValidationError" });
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("allows a variant whose stock is not yet tracked (opt-in tracking — no row is not a failure)", async () => {
    const variantStockRepo = fakeVariantStockRepository({
      getByVariantId: vi.fn(async () => null),
    });
    const { checkout, orderRepo } = buildCheckoutService({ variantStockRepo });

    await checkout.checkout(
      null,
      makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 5 }] }),
    );

    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ variantId: VARIANT_ID })],
      }),
    );
  });

  it("reserves product stock regardless of variantId", async () => {
    const variantStockRepo = fakeVariantStockRepository({
      getByVariantId: vi.fn(async () => ({
        variantId: VARIANT_ID,
        stock: 10,
        lowStockThreshold: null,
      })),
    });
    const { checkout, productRepo } = buildCheckoutService({ variantStockRepo });

    await checkout.checkout(
      null,
      makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 2 }] }),
    );

    expect(productRepo.reserveStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 2 }]);
  });
});

describe("CheckoutService.checkout — variant stock reservation (Stage 19)", () => {
  it("reserves variant stock alongside product stock when variantId is present", async () => {
    const variantStockRepo = fakeVariantStockRepository({
      getByVariantId: vi.fn(async () => ({
        variantId: VARIANT_ID,
        stock: 10,
        lowStockThreshold: null,
      })),
    });
    const { checkout, productRepo } = buildCheckoutService({ variantStockRepo });

    await checkout.checkout(
      null,
      makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 3 }] }),
    );

    expect(productRepo.reserveStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 3 }]);
    expect(variantStockRepo.reserveStock).toHaveBeenCalledWith([
      { variantId: VARIANT_ID, quantity: 3 },
    ]);
  });

  it("never calls variantStock.reserveStock/releaseStock when no item has a variantId — full backward compatibility", async () => {
    const variantStockRepo = fakeVariantStockRepository();
    const { checkout } = buildCheckoutService({ variantStockRepo });

    await checkout.checkout(null, makeRequest());

    expect(variantStockRepo.reserveStock).not.toHaveBeenCalled();
    expect(variantStockRepo.releaseStock).not.toHaveBeenCalled();
  });

  it("releases the just-reserved product stock when variant stock reservation fails, and does not create an order", async () => {
    const variantStockRepo = fakeVariantStockRepository({
      getByVariantId: vi.fn(async () => ({
        variantId: VARIANT_ID,
        stock: 10,
        lowStockThreshold: null,
      })),
      reserveStock: vi.fn(async () => {
        throw new Error("INSUFFICIENT_VARIANT_STOCK:" + VARIANT_ID);
      }),
    });
    const { checkout, productRepo, orderRepo } = buildCheckoutService({ variantStockRepo });

    await expect(
      checkout.checkout(
        null,
        makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 3 }] }),
      ),
    ).rejects.toThrow();

    expect(productRepo.reserveStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 3 }]);
    expect(productRepo.releaseStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 3 }]);
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("releases both product and variant stock when a later checkout step fails (mirrors InventoryService's existing rollback)", async () => {
    const variantStockRepo = fakeVariantStockRepository({
      getByVariantId: vi.fn(async () => ({
        variantId: VARIANT_ID,
        stock: 10,
        lowStockThreshold: null,
      })),
    });
    const paymentPolicy = fakePaymentPolicy({
      assertCanUsePaymentMethod: vi.fn(() => {
        throw new Error("POLICY_DENIED");
      }),
    });
    const { checkout, productRepo } = buildCheckoutService({ variantStockRepo, paymentPolicy });

    await expect(
      checkout.checkout(
        null,
        makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 2 }] }),
      ),
    ).rejects.toThrow("POLICY_DENIED");

    expect(productRepo.releaseStock).toHaveBeenCalledWith([{ productId: PRODUCT_ID, quantity: 2 }]);
    expect(variantStockRepo.releaseStock).toHaveBeenCalledWith([
      { variantId: VARIANT_ID, quantity: 2 },
    ]);
  });

  it("does not release variant stock after a successful checkout", async () => {
    const variantStockRepo = fakeVariantStockRepository({
      getByVariantId: vi.fn(async () => ({
        variantId: VARIANT_ID,
        stock: 10,
        lowStockThreshold: null,
      })),
    });
    const { checkout } = buildCheckoutService({ variantStockRepo });

    await checkout.checkout(
      null,
      makeRequest({ items: [{ productId: PRODUCT_ID, variantId: VARIANT_ID, quantity: 2 }] }),
    );

    expect(variantStockRepo.releaseStock).not.toHaveBeenCalled();
  });
});
