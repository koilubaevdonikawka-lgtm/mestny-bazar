import { describe, expect, it, vi } from "vitest";
import { PaymentService } from "@server/domain/payment.service";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import { PaymentProviderError, PaymentRetryNotAllowedError } from "@server/domain/payment.errors";
import { RetryableError } from "@shared/lib/with-retry";
import type { IPaymentRepository } from "@server/ports/payment.repository";
import type { IPaymentProvider } from "@server/ports/payment.provider";
import type { OrderService } from "@server/domain/order.service";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { InventoryService } from "@server/domain/inventory.service";
import type { VariantStockService } from "@server/domain/variant-stock.service";
import type { OrderDTO } from "@shared/contracts/order";
import type {
  CreatePaymentRequest,
  PaymentIntentDTO,
  PaymentRecordDTO,
} from "@shared/contracts/payment";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1001,
    status: "CREATED",
    paymentStatus: "awaiting",
    paymentMethod: "ONLINE",
    subtotal: 500,
    deliveryFee: 0,
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
    discountAmount: 0,
    couponCode: null,
    total: 500,
    currency: "KGS",
    customerName: "Иван Иванов",
    customerPhone: "996700000000",
    addressSnapshot: "г. Кант, ул. Ленина 12",
    notes: null,
    paymentUrl: null,
    items: [],
    createdAt: new Date().toISOString(),
    paidAt: null,
    assignedCourierId: null,
    ...overrides,
  };
}

function makePaymentRecord(overrides: Partial<PaymentRecordDTO> = {}): PaymentRecordDTO {
  return {
    id: "payment-1",
    orderId: "order-1",
    provider: "finik",
    providerPaymentId: "provider-payment-1",
    idempotencyKey: "idem-1",
    amount: 500,
    currency: "KGS",
    status: "awaiting",
    paymentUrl: "https://pay.example.com/session/1",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    failureReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeIntent(overrides: Partial<PaymentIntentDTO> = {}): PaymentIntentDTO {
  return {
    id: "provider-payment-1",
    orderId: "order-1",
    amount: 500,
    currency: "KGS",
    status: "awaiting",
    paymentUrl: "https://pay.example.com/session/1",
    providerPaymentId: "provider-payment-1",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function fakePayments(overrides: Partial<IPaymentRepository> = {}): IPaymentRepository {
  return {
    create: vi.fn(async () => makePaymentRecord()),
    getById: vi.fn(async () => makePaymentRecord()),
    getByOrderId: vi.fn(async () => makePaymentRecord()),
    getByIdempotencyKey: vi.fn(async () => null),
    getByProviderPaymentId: vi.fn(async () => null),
    updateStatus: vi.fn(async () => makePaymentRecord()),
    markProviderPaymentId: vi.fn(async () => makePaymentRecord()),
    logEvent: vi.fn(async () => {}),
    ...overrides,
  } as IPaymentRepository;
}

function fakeProvider(overrides: Partial<IPaymentProvider> = {}): IPaymentProvider {
  return {
    createPayment: vi.fn(async () => makeIntent()),
    verifyWebhook: vi.fn(async () => true),
    getStatus: vi.fn(async () => makeIntent()),
    ...overrides,
  } as IPaymentProvider;
}

function fakeOrders(overrides: Partial<OrderService> = {}): OrderService {
  return {
    getOrder: vi.fn(async () => makeOrder()),
    confirmPayment: vi.fn(async () => makeOrder({ status: "PAID", paymentStatus: "paid" })),
    ...overrides,
  } as unknown as OrderService;
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

/** sweepExpiry()'s own dependencies (Промпт №087) — irrelevant to every pre-existing test in this file (none of them exercise sweepExpiry), so these are just enough of a stub to satisfy the constructor. */
function fakeOrderRepository(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    updateStatus: vi.fn(async () => makeOrder({ status: "CANCELLED" })),
    ...overrides,
  } as unknown as IOrderRepository;
}

function fakeOrderLifecycle(overrides: Partial<IOrderLifecyclePolicy> = {}): IOrderLifecyclePolicy {
  return {
    canTransition: vi.fn(() => ({ allowed: true })),
    assertCanTransition: vi.fn(),
    ...overrides,
  };
}

function fakeInventory(overrides: Partial<InventoryService> = {}): InventoryService {
  return {
    releaseStock: vi.fn(async () => {}),
    ...overrides,
  } as unknown as InventoryService;
}

function fakeVariantStock(overrides: Partial<VariantStockService> = {}): VariantStockService {
  return {
    releaseStock: vi.fn(async () => {}),
    ...overrides,
  } as unknown as VariantStockService;
}

const APP_URL = "https://mesnyibazar.com";

function makeService(
  payments: IPaymentRepository,
  provider: IPaymentProvider,
  orders: OrderService,
  events: IMarketplaceEventBus,
  appUrl: string,
): PaymentService {
  return new PaymentService(
    payments,
    provider,
    orders,
    events,
    appUrl,
    fakeOrderRepository(),
    fakeOrderLifecycle(),
    fakeInventory(),
    fakeVariantStock(),
  );
}

describe("PaymentService.initiatePayment", () => {
  it("returns the existing payment untouched when the idempotency key was already used", async () => {
    const existing = makePaymentRecord();
    const payments = fakePayments({ getByIdempotencyKey: vi.fn(async () => existing) });
    const provider = fakeProvider();
    const service = makeService(payments, provider, fakeOrders(), fakeEventBus(), APP_URL);

    const result = await service.initiatePayment(makeOrder(), "idem-1");

    expect(result).toEqual({ paymentUrl: existing.paymentUrl, paymentId: existing.id });
    expect(provider.createPayment).not.toHaveBeenCalled();
  });

  it("creates a payment via the provider, persists it, and publishes payment.initiated", async () => {
    const payments = fakePayments();
    const provider = fakeProvider();
    const events = fakeEventBus();
    const service = makeService(payments, provider, fakeOrders(), events, APP_URL);

    const result = await service.initiatePayment(makeOrder(), "idem-1");

    expect(provider.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        idempotencyKey: "idem-1",
        returnUrl: expect.stringContaining(APP_URL),
      }),
    );
    expect(payments.create).toHaveBeenCalled();
    expect(payments.logEvent).toHaveBeenCalledWith("payment-1", "created", expect.anything());
    expect(events.publish).toHaveBeenCalledWith({
      type: "payment.initiated",
      order: expect.anything(),
      paymentId: "payment-1",
    });
    expect(result.paymentUrl).toBe("https://pay.example.com/session/1");
  });

  it("retries on RetryableError and succeeds on a later attempt", async () => {
    let attempts = 0;
    const provider = fakeProvider({
      createPayment: vi.fn(async () => {
        attempts++;
        if (attempts < 2) throw new RetryableError("network blip");
        return makeIntent();
      }),
    });
    const service = makeService(fakePayments(), provider, fakeOrders(), fakeEventBus(), APP_URL);

    await service.initiatePayment(makeOrder(), "idem-1");

    expect(attempts).toBe(2);
  });

  it("throws PaymentProviderError after exhausting retries", async () => {
    const provider = fakeProvider({
      createPayment: vi.fn(async () => {
        throw new RetryableError("provider down");
      }),
    });
    const service = makeService(fakePayments(), provider, fakeOrders(), fakeEventBus(), APP_URL);

    await expect(service.initiatePayment(makeOrder(), "idem-1")).rejects.toBeInstanceOf(
      PaymentProviderError,
    );
  });

  it("does not retry a non-retryable (4xx-class) provider error", async () => {
    const provider = fakeProvider({
      createPayment: vi.fn(async () => {
        throw new Error("bad request");
      }),
    });
    const service = makeService(fakePayments(), provider, fakeOrders(), fakeEventBus(), APP_URL);

    await expect(service.initiatePayment(makeOrder(), "idem-1")).rejects.toBeInstanceOf(
      PaymentProviderError,
    );
    expect(provider.createPayment).toHaveBeenCalledTimes(1);
  });
});

const WEBHOOK_REQUEST = {
  rawBody: "raw",
  signature: "sig",
  httpMethod: "POST",
  path: "/api/webhooks/finik",
  host: "mesnyibazar.com",
  headers: { "x-api-timestamp": "1700000000" },
  queryStringParameters: null,
};

describe("PaymentService.handleWebhook", () => {
  it("rejects and logs signature_invalid when the signature does not verify", async () => {
    const payments = fakePayments({
      getByProviderPaymentId: vi.fn(async () => makePaymentRecord()),
    });
    const provider = fakeProvider({ verifyWebhook: vi.fn(async () => false) });
    const service = makeService(payments, provider, fakeOrders(), fakeEventBus(), APP_URL);

    const result = await service.handleWebhook(WEBHOOK_REQUEST, {
      providerPaymentId: "provider-payment-1",
      transactionId: "txn-1",
      status: "paid",
    });

    expect(result).toEqual({ accepted: false, reason: "invalid_signature" });
    expect(payments.logEvent).toHaveBeenCalledWith("payment-1", "signature_invalid");
  });

  it("confirms payment and transitions the order to PAID on a valid paid webhook", async () => {
    const payments = fakePayments({
      getByProviderPaymentId: vi.fn(async () => makePaymentRecord({ status: "awaiting" })),
    });
    const orders = fakeOrders();
    const events = fakeEventBus();
    const service = makeService(payments, fakeProvider(), orders, events, APP_URL);

    const result = await service.handleWebhook(WEBHOOK_REQUEST, {
      providerPaymentId: "provider-payment-1",
      transactionId: "txn-1",
      status: "paid",
    });

    expect(result).toEqual({ accepted: true });
    expect(payments.updateStatus).toHaveBeenCalledWith("payment-1", "paid");
    expect(orders.confirmPayment).toHaveBeenCalledWith("order-1");
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "payment.confirmed", paymentId: "payment-1" }),
    );
  });

  it("is idempotent — a redelivered webhook for an already-paid payment is a no-op", async () => {
    const payments = fakePayments({
      getByProviderPaymentId: vi.fn(async () => makePaymentRecord({ status: "paid" })),
    });
    const orders = fakeOrders();
    const service = makeService(payments, fakeProvider(), orders, fakeEventBus(), APP_URL);

    const result = await service.handleWebhook(WEBHOOK_REQUEST, {
      providerPaymentId: "provider-payment-1",
      transactionId: "txn-1",
      status: "paid",
    });

    expect(result).toEqual({ accepted: true });
    expect(orders.confirmPayment).not.toHaveBeenCalled();
    expect(payments.updateStatus).not.toHaveBeenCalled();
  });

  it("marks the payment failed on a valid failed webhook, without confirming the order", async () => {
    const payments = fakePayments({
      getByProviderPaymentId: vi.fn(async () => makePaymentRecord({ status: "awaiting" })),
    });
    const orders = fakeOrders();
    const events = fakeEventBus();
    const service = makeService(payments, fakeProvider(), orders, events, APP_URL);

    const result = await service.handleWebhook(WEBHOOK_REQUEST, {
      providerPaymentId: "provider-payment-1",
      transactionId: "txn-1",
      status: "failed",
    });

    expect(result).toEqual({ accepted: true });
    expect(orders.confirmPayment).not.toHaveBeenCalled();
    expect(payments.updateStatus).toHaveBeenCalledWith("payment-1", "failed", expect.anything());
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "payment.failed" }),
    );
  });

  it("logs the transactionId on webhook_received (redelivery traceability)", async () => {
    const payments = fakePayments({
      getByProviderPaymentId: vi.fn(async () => makePaymentRecord({ status: "awaiting" })),
    });
    const service = makeService(payments, fakeProvider(), fakeOrders(), fakeEventBus(), APP_URL);

    await service.handleWebhook(WEBHOOK_REQUEST, {
      providerPaymentId: "provider-payment-1",
      transactionId: "txn-42",
      status: "paid",
    });

    expect(payments.logEvent).toHaveBeenCalledWith(
      "payment-1",
      "webhook_received",
      expect.objectContaining({ transactionId: "txn-42" }),
    );
  });

  it("rejects with unknown_order when no local payment record matches providerPaymentId", async () => {
    const payments = fakePayments({ getByProviderPaymentId: vi.fn(async () => null) });
    const service = makeService(payments, fakeProvider(), fakeOrders(), fakeEventBus(), APP_URL);

    const result = await service.handleWebhook(WEBHOOK_REQUEST, {
      providerPaymentId: "ghost-payment",
      transactionId: "txn-1",
      status: "paid",
    });

    expect(result).toEqual({ accepted: false, reason: "unknown_order" });
  });
});

describe("PaymentService.recheckStatus", () => {
  it("reconciles a payment from pending to paid and confirms the order", async () => {
    const payments = fakePayments({
      getById: vi.fn(async () => makePaymentRecord({ status: "awaiting" })),
    });
    const provider = fakeProvider({ getStatus: vi.fn(async () => makeIntent({ status: "paid" })) });
    const orders = fakeOrders();
    const service = makeService(payments, provider, orders, fakeEventBus(), APP_URL);

    await service.recheckStatus("payment-1");

    expect(payments.updateStatus).toHaveBeenCalledWith("payment-1", "paid");
    expect(orders.confirmPayment).toHaveBeenCalledWith("order-1");
  });

  it("is a no-op for a payment already in a terminal state", async () => {
    const payments = fakePayments({
      getById: vi.fn(async () => makePaymentRecord({ status: "paid" })),
    });
    const provider = fakeProvider();
    const service = makeService(payments, provider, fakeOrders(), fakeEventBus(), APP_URL);

    await service.recheckStatus("payment-1");

    expect(provider.getStatus).not.toHaveBeenCalled();
  });
});

describe("PaymentService.checkExpiry", () => {
  it("marks a pending payment past its expiry as expired", async () => {
    const payments = fakePayments({
      updateStatus: vi.fn(async () => makePaymentRecord({ status: "expired" })),
    });
    const service = makeService(payments, fakeProvider(), fakeOrders(), fakeEventBus(), APP_URL);
    const expired = makePaymentRecord({
      status: "awaiting",
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });

    const result = await service.checkExpiry(expired);

    expect(payments.updateStatus).toHaveBeenCalledWith("payment-1", "expired");
    expect(result.status).toBe("expired");
  });

  it("leaves a not-yet-expired payment untouched", async () => {
    const payments = fakePayments();
    const service = makeService(payments, fakeProvider(), fakeOrders(), fakeEventBus(), APP_URL);
    const active = makePaymentRecord({
      status: "awaiting",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    await service.checkExpiry(active);

    expect(payments.updateStatus).not.toHaveBeenCalled();
  });
});

describe("PaymentService.sweepExpiry", () => {
  const expiredCandidate = makePaymentRecord({
    status: "awaiting",
    expiresAt: new Date(Date.now() - 1000).toISOString(),
  });

  it("releases product + variant stock, cancels the order, and publishes payment.expired", async () => {
    const payments = fakePayments({
      updateStatus: vi.fn(async () => makePaymentRecord({ status: "expired" })),
    });
    const order = makeOrder({
      status: "CREATED",
      items: [
        {
          id: "item-1",
          productId: "product-1",
          variantId: null,
          productName: "Мука",
          productImageUrl: null,
          quantity: 2,
          unitPrice: 100,
          lineTotal: 200,
        },
        {
          id: "item-2",
          productId: "product-2",
          variantId: "variant-1",
          productName: "Масло",
          productImageUrl: null,
          quantity: 1,
          unitPrice: 300,
          lineTotal: 300,
        },
      ],
    });
    const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
    const orderRepository = fakeOrderRepository({
      updateStatus: vi.fn(async () => makeOrder({ ...order, status: "CANCELLED" })),
    });
    const orderLifecycle = fakeOrderLifecycle();
    const inventory = fakeInventory();
    const variantStock = fakeVariantStock();
    const events = fakeEventBus();
    const service = new PaymentService(
      payments,
      fakeProvider(),
      orders,
      events,
      APP_URL,
      orderRepository,
      orderLifecycle,
      inventory,
      variantStock,
    );

    const result = await service.sweepExpiry(expiredCandidate);

    expect(result.status).toBe("expired");
    expect(orderLifecycle.canTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        currentStatus: "CREATED",
        targetStatus: "CANCELLED",
        reason: "payment_expired",
      }),
    );
    expect(orderRepository.updateStatus).toHaveBeenCalledWith("order-1", "CREATED", "CANCELLED");
    expect(inventory.releaseStock).toHaveBeenCalledWith([
      { productId: "product-1", quantity: 2 },
      { productId: "product-2", quantity: 1 },
    ]);
    expect(variantStock.releaseStock).toHaveBeenCalledWith([
      { variantId: "variant-1", quantity: 1 },
    ]);
    expect(events.publish).toHaveBeenCalledWith({
      type: "payment.expired",
      order: expect.objectContaining({ status: "CANCELLED" }),
      paymentId: "payment-1",
    });
  });

  it("does not cascade for a payment that was already expired before this call", async () => {
    const alreadyExpired = makePaymentRecord({ status: "expired" });
    const payments = fakePayments();
    const orders = fakeOrders();
    const orderRepository = fakeOrderRepository();
    const inventory = fakeInventory();
    const variantStock = fakeVariantStock();
    const service = new PaymentService(
      payments,
      fakeProvider(),
      orders,
      fakeEventBus(),
      APP_URL,
      orderRepository,
      fakeOrderLifecycle(),
      inventory,
      variantStock,
    );

    await service.sweepExpiry(alreadyExpired);

    expect(orders.getOrder).not.toHaveBeenCalled();
    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
    expect(inventory.releaseStock).not.toHaveBeenCalled();
    expect(variantStock.releaseStock).not.toHaveBeenCalled();
  });

  it("does not cascade when checkExpiry leaves the payment unchanged (not actually past expiry)", async () => {
    const notYetExpired = makePaymentRecord({
      status: "awaiting",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    const payments = fakePayments();
    const orders = fakeOrders();
    const service = new PaymentService(
      payments,
      fakeProvider(),
      orders,
      fakeEventBus(),
      APP_URL,
      fakeOrderRepository(),
      fakeOrderLifecycle(),
      fakeInventory(),
      fakeVariantStock(),
    );

    await service.sweepExpiry(notYetExpired);

    expect(orders.getOrder).not.toHaveBeenCalled();
  });

  it("skips the cascade without error when the order-lifecycle policy denies the transition (e.g. already cancelled by the customer)", async () => {
    const payments = fakePayments({
      updateStatus: vi.fn(async () => makePaymentRecord({ status: "expired" })),
    });
    const order = makeOrder({ status: "CANCELLED" });
    const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
    const orderRepository = fakeOrderRepository();
    const orderLifecycle = fakeOrderLifecycle({
      canTransition: vi.fn(() => ({ allowed: false, denialCode: "TERMINAL_STATE" })),
    });
    const inventory = fakeInventory();
    const variantStock = fakeVariantStock();
    const events = fakeEventBus();
    const service = new PaymentService(
      payments,
      fakeProvider(),
      orders,
      events,
      APP_URL,
      orderRepository,
      orderLifecycle,
      inventory,
      variantStock,
    );

    const result = await service.sweepExpiry(expiredCandidate);

    expect(result.status).toBe("expired");
    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
    expect(inventory.releaseStock).not.toHaveBeenCalled();
    expect(variantStock.releaseStock).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("returns the expired payment record without crashing when the order can't be found", async () => {
    const payments = fakePayments({
      updateStatus: vi.fn(async () => makePaymentRecord({ status: "expired" })),
    });
    const orders = fakeOrders({ getOrder: vi.fn(async () => null) });
    const orderRepository = fakeOrderRepository();
    const service = new PaymentService(
      payments,
      fakeProvider(),
      orders,
      fakeEventBus(),
      APP_URL,
      orderRepository,
      fakeOrderLifecycle(),
      fakeInventory(),
      fakeVariantStock(),
    );

    const result = await service.sweepExpiry(expiredCandidate);

    expect(result.status).toBe("expired");
    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
  });
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("PaymentService.retryPayment", () => {
  it("БАГ 3: retries even when no payment record exists yet (preparePayment failed before persisting one)", async () => {
    const order = makeOrder({ paymentMethod: "ONLINE", paymentStatus: "awaiting" });
    const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
    const payments = fakePayments({ getByOrderId: vi.fn(async () => null) });
    const provider = fakeProvider();
    const service = makeService(payments, provider, orders, fakeEventBus(), APP_URL);

    const result = await service.retryPayment("order-1", "user-1");

    expect(orders.getOrder).toHaveBeenCalledWith("order-1", "user-1");
    expect(provider.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: expect.stringMatching(UUID_RE) }),
    );
    expect(result.paymentUrl).toBe("https://pay.example.com/session/1");
  });

  it("mints a fresh idempotency key, distinct from the previous failed attempt's", async () => {
    const order = makeOrder({ paymentMethod: "ONLINE", paymentStatus: "failed" });
    const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
    const previous = makePaymentRecord({ idempotencyKey: "old-failed-key", status: "failed" });
    const payments = fakePayments({ getByOrderId: vi.fn(async () => previous) });
    const createPayment = vi.fn(async (_request: CreatePaymentRequest) => makeIntent());
    const provider = fakeProvider({ createPayment });
    const service = makeService(payments, provider, orders, fakeEventBus(), APP_URL);

    await service.retryPayment("order-1", "user-1");

    const call = createPayment.mock.calls[0][0];
    expect(call.idempotencyKey).not.toBe("old-failed-key");
    expect(call.idempotencyKey).toMatch(UUID_RE);
  });

  it("throws OrderNotFoundError when the order doesn't exist or doesn't belong to the caller", async () => {
    const orders = fakeOrders({ getOrder: vi.fn(async () => null) });
    const service = makeService(fakePayments(), fakeProvider(), orders, fakeEventBus(), APP_URL);

    await expect(service.retryPayment("order-1", "user-1")).rejects.toBeInstanceOf(
      OrderNotFoundError,
    );
  });

  it("rejects a CASH order — nothing online was ever attempted", async () => {
    const order = makeOrder({ paymentMethod: "CASH", paymentStatus: "unpaid" });
    const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
    const provider = fakeProvider();
    const service = makeService(fakePayments(), provider, orders, fakeEventBus(), APP_URL);

    await expect(service.retryPayment("order-1", "user-1")).rejects.toBeInstanceOf(
      PaymentRetryNotAllowedError,
    );
    expect(provider.createPayment).not.toHaveBeenCalled();
  });

  it("rejects a cancelled order", async () => {
    const order = makeOrder({
      paymentMethod: "ONLINE",
      paymentStatus: "awaiting",
      status: "CANCELLED",
    });
    const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
    const service = makeService(fakePayments(), fakeProvider(), orders, fakeEventBus(), APP_URL);

    await expect(service.retryPayment("order-1", "user-1")).rejects.toBeInstanceOf(
      PaymentRetryNotAllowedError,
    );
  });

  it.each(["paid", "refunded"] as const)(
    "rejects an order whose payment already resolved to %s",
    async (paymentStatus) => {
      const order = makeOrder({ paymentMethod: "ONLINE", paymentStatus });
      const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
      const provider = fakeProvider();
      const service = makeService(fakePayments(), provider, orders, fakeEventBus(), APP_URL);

      await expect(service.retryPayment("order-1", "user-1")).rejects.toBeInstanceOf(
        PaymentRetryNotAllowedError,
      );
      expect(provider.createPayment).not.toHaveBeenCalled();
    },
  );
});
