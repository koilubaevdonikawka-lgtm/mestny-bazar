import { describe, expect, it, vi } from "vitest";
import { CheckoutService } from "@server/domain/checkout.service";
import { OrderService } from "@server/domain/order.service";
import { PricingService } from "@server/domain/pricing.service";
import { InventoryService } from "@server/domain/inventory.service";
import { InsufficientStockError } from "@server/domain/checkout.errors";
import type { CreateOrderData, IOrderRepository } from "@server/ports/order.repository";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import type { IAddressRepository } from "@server/ports/address.repository";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import type { ICheckoutPaymentHandler } from "@server/ports/checkout-payment.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { IPaymentPolicy, PaymentPolicyContext } from "@server/ports/payment-policy.port";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { CreateOrderRequest, OrderDTO } from "@shared/contracts/order";
import type { ProductDTO } from "@shared/contracts/catalog";

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
    stock: 10,
    inStock: true,
    categoryId: null,
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
    calculateFee: vi.fn(async () => ({
      zoneId: "zone-1",
      zoneName: "Zone",
      fee: 0,
      freeFrom: null,
      subtotal: 0,
      isFree: true,
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

function buildCheckoutService(deps: {
  orderRepo?: IOrderRepository;
  productRepo?: IProductRepository;
  addressRepo?: IAddressRepository;
  zoneRepo?: IDeliveryZoneRepository;
  paymentHandler?: ICheckoutPaymentHandler;
  eventBus?: IMarketplaceEventBus;
  paymentPolicy?: IPaymentPolicy;
  orderLifecycle?: IOrderLifecyclePolicy;
}) {
  const orderRepo = deps.orderRepo ?? fakeOrderRepository();
  const productRepo = deps.productRepo ?? fakeProductRepository();
  const orderLifecycle = deps.orderLifecycle ?? fakeOrderLifecycle();

  const orderService = new OrderService(orderRepo, orderLifecycle);
  const pricing = new PricingService(deps.zoneRepo ?? fakeZoneRepository());
  const inventory = new InventoryService(productRepo);

  const checkout = new CheckoutService(
    orderService,
    productRepo,
    deps.addressRepo ?? fakeAddressRepository(),
    deps.zoneRepo ?? fakeZoneRepository(),
    pricing,
    inventory,
    deps.paymentHandler ?? fakePaymentHandler(),
    deps.eventBus ?? fakeEventBus(),
    deps.paymentPolicy ?? fakePaymentPolicy(),
    orderLifecycle,
  );

  return { checkout, orderRepo, productRepo };
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
