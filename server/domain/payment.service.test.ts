import { describe, expect, it, vi } from "vitest";
import { PaymentService } from "@server/domain/payment.service";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import { PaymentProviderError, PaymentRetryNotAllowedError } from "@server/domain/payment.errors";
import { RetryableError } from "@shared/lib/with-retry";
import type { IPaymentRepository } from "@server/ports/payment.repository";
import type { IPaymentProvider } from "@server/ports/payment.provider";
import type { OrderService } from "@server/domain/order.service";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
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

const APP_URL = "https://mesnyibazar.com";

describe("PaymentService.initiatePayment", () => {
  it("returns the existing payment untouched when the idempotency key was already used", async () => {
    const existing = makePaymentRecord();
    const payments = fakePayments({ getByIdempotencyKey: vi.fn(async () => existing) });
    const provider = fakeProvider();
    const service = new PaymentService(payments, provider, fakeOrders(), fakeEventBus(), APP_URL);

    const result = await service.initiatePayment(makeOrder(), "idem-1");

    expect(result).toEqual({ paymentUrl: existing.paymentUrl, paymentId: existing.id });
    expect(provider.createPayment).not.toHaveBeenCalled();
  });

  it("creates a payment via the provider, persists it, and publishes payment.initiated", async () => {
    const payments = fakePayments();
    const provider = fakeProvider();
    const events = fakeEventBus();
    const service = new PaymentService(payments, provider, fakeOrders(), events, APP_URL);

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
    const service = new PaymentService(
      fakePayments(),
      provider,
      fakeOrders(),
      fakeEventBus(),
      APP_URL,
    );

    await service.initiatePayment(makeOrder(), "idem-1");

    expect(attempts).toBe(2);
  });

  it("throws PaymentProviderError after exhausting retries", async () => {
    const provider = fakeProvider({
      createPayment: vi.fn(async () => {
        throw new RetryableError("provider down");
      }),
    });
    const service = new PaymentService(
      fakePayments(),
      provider,
      fakeOrders(),
      fakeEventBus(),
      APP_URL,
    );

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
    const service = new PaymentService(
      fakePayments(),
      provider,
      fakeOrders(),
      fakeEventBus(),
      APP_URL,
    );

    await expect(service.initiatePayment(makeOrder(), "idem-1")).rejects.toBeInstanceOf(
      PaymentProviderError,
    );
    expect(provider.createPayment).toHaveBeenCalledTimes(1);
  });
});

describe("PaymentService.handleWebhook", () => {
  it("rejects and logs signature_invalid when the signature does not verify", async () => {
    const payments = fakePayments();
    const provider = fakeProvider({ verifyWebhook: vi.fn(async () => false) });
    const service = new PaymentService(payments, provider, fakeOrders(), fakeEventBus(), APP_URL);

    const result = await service.handleWebhook("raw", "bad-sig", "1700000000", {
      providerPaymentId: "provider-payment-1",
      orderId: "order-1",
      status: "paid",
    });

    expect(result).toEqual({ accepted: false, reason: "invalid_signature" });
    expect(payments.logEvent).toHaveBeenCalledWith("payment-1", "signature_invalid");
  });

  it("confirms payment and transitions the order to PAID on a valid paid webhook", async () => {
    const payments = fakePayments({
      getByOrderId: vi.fn(async () => makePaymentRecord({ status: "awaiting" })),
    });
    const orders = fakeOrders();
    const events = fakeEventBus();
    const service = new PaymentService(payments, fakeProvider(), orders, events, APP_URL);

    const result = await service.handleWebhook("raw", "good-sig", "1700000000", {
      providerPaymentId: "provider-payment-1",
      orderId: "order-1",
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
      getByOrderId: vi.fn(async () => makePaymentRecord({ status: "paid" })),
    });
    const orders = fakeOrders();
    const service = new PaymentService(payments, fakeProvider(), orders, fakeEventBus(), APP_URL);

    const result = await service.handleWebhook("raw", "good-sig", "1700000000", {
      providerPaymentId: "provider-payment-1",
      orderId: "order-1",
      status: "paid",
    });

    expect(result).toEqual({ accepted: true });
    expect(orders.confirmPayment).not.toHaveBeenCalled();
    expect(payments.updateStatus).not.toHaveBeenCalled();
  });

  it("marks the payment failed on a valid failed webhook, without confirming the order", async () => {
    const payments = fakePayments({
      getByOrderId: vi.fn(async () => makePaymentRecord({ status: "awaiting" })),
    });
    const orders = fakeOrders();
    const events = fakeEventBus();
    const service = new PaymentService(payments, fakeProvider(), orders, events, APP_URL);

    const result = await service.handleWebhook("raw", "good-sig", "1700000000", {
      providerPaymentId: "provider-payment-1",
      orderId: "order-1",
      status: "failed",
    });

    expect(result).toEqual({ accepted: true });
    expect(orders.confirmPayment).not.toHaveBeenCalled();
    expect(payments.updateStatus).toHaveBeenCalledWith("payment-1", "failed", expect.anything());
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "payment.failed" }),
    );
  });

  it("rejects with unknown_order when no local payment record matches", async () => {
    const payments = fakePayments({ getByOrderId: vi.fn(async () => null) });
    const service = new PaymentService(
      payments,
      fakeProvider(),
      fakeOrders(),
      fakeEventBus(),
      APP_URL,
    );

    const result = await service.handleWebhook("raw", "good-sig", "1700000000", {
      providerPaymentId: "provider-payment-1",
      orderId: "ghost-order",
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
    const service = new PaymentService(payments, provider, orders, fakeEventBus(), APP_URL);

    await service.recheckStatus("payment-1");

    expect(payments.updateStatus).toHaveBeenCalledWith("payment-1", "paid");
    expect(orders.confirmPayment).toHaveBeenCalledWith("order-1");
  });

  it("is a no-op for a payment already in a terminal state", async () => {
    const payments = fakePayments({
      getById: vi.fn(async () => makePaymentRecord({ status: "paid" })),
    });
    const provider = fakeProvider();
    const service = new PaymentService(payments, provider, fakeOrders(), fakeEventBus(), APP_URL);

    await service.recheckStatus("payment-1");

    expect(provider.getStatus).not.toHaveBeenCalled();
  });
});

describe("PaymentService.checkExpiry", () => {
  it("marks a pending payment past its expiry as expired", async () => {
    const payments = fakePayments({
      updateStatus: vi.fn(async () => makePaymentRecord({ status: "expired" })),
    });
    const service = new PaymentService(
      payments,
      fakeProvider(),
      fakeOrders(),
      fakeEventBus(),
      APP_URL,
    );
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
    const service = new PaymentService(
      payments,
      fakeProvider(),
      fakeOrders(),
      fakeEventBus(),
      APP_URL,
    );
    const active = makePaymentRecord({
      status: "awaiting",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    await service.checkExpiry(active);

    expect(payments.updateStatus).not.toHaveBeenCalled();
  });
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("PaymentService.retryPayment", () => {
  it("БАГ 3: retries even when no payment record exists yet (preparePayment failed before persisting one)", async () => {
    const order = makeOrder({ paymentMethod: "ONLINE", paymentStatus: "awaiting" });
    const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
    const payments = fakePayments({ getByOrderId: vi.fn(async () => null) });
    const provider = fakeProvider();
    const service = new PaymentService(payments, provider, orders, fakeEventBus(), APP_URL);

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
    const service = new PaymentService(payments, provider, orders, fakeEventBus(), APP_URL);

    await service.retryPayment("order-1", "user-1");

    const call = createPayment.mock.calls[0][0];
    expect(call.idempotencyKey).not.toBe("old-failed-key");
    expect(call.idempotencyKey).toMatch(UUID_RE);
  });

  it("throws OrderNotFoundError when the order doesn't exist or doesn't belong to the caller", async () => {
    const orders = fakeOrders({ getOrder: vi.fn(async () => null) });
    const service = new PaymentService(
      fakePayments(),
      fakeProvider(),
      orders,
      fakeEventBus(),
      APP_URL,
    );

    await expect(service.retryPayment("order-1", "user-1")).rejects.toBeInstanceOf(
      OrderNotFoundError,
    );
  });

  it("rejects a CASH order — nothing online was ever attempted", async () => {
    const order = makeOrder({ paymentMethod: "CASH", paymentStatus: "unpaid" });
    const orders = fakeOrders({ getOrder: vi.fn(async () => order) });
    const provider = fakeProvider();
    const service = new PaymentService(fakePayments(), provider, orders, fakeEventBus(), APP_URL);

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
    const service = new PaymentService(
      fakePayments(),
      fakeProvider(),
      orders,
      fakeEventBus(),
      APP_URL,
    );

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
      const service = new PaymentService(fakePayments(), provider, orders, fakeEventBus(), APP_URL);

      await expect(service.retryPayment("order-1", "user-1")).rejects.toBeInstanceOf(
        PaymentRetryNotAllowedError,
      );
      expect(provider.createPayment).not.toHaveBeenCalled();
    },
  );
});
