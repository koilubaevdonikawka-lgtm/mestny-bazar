import { describe, expect, it, vi } from "vitest";
import { CheckoutPaymentHandler } from "@server/adapters/payment/checkout-payment.handler";
import type { PaymentService } from "@server/domain/payment.service";
import type { OrderDTO } from "@shared/contracts/order";

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

function fakePaymentService(overrides: Partial<PaymentService> = {}): PaymentService {
  return {
    initiatePayment: vi.fn(async () => ({
      paymentUrl: "https://pay.example.com/1",
      paymentId: "payment-1",
    })),
    ...overrides,
  } as unknown as PaymentService;
}

describe("CheckoutPaymentHandler.preparePayment", () => {
  it("CASH: returns unpaid with no payment URL, never touching PaymentService", async () => {
    const paymentService = fakePaymentService();
    const handler = new CheckoutPaymentHandler(paymentService);

    const result = await handler.preparePayment("CASH", makeOrder(), "idem-1");

    expect(result).toEqual({ paymentUrl: null, paymentStatus: "unpaid" });
    expect(paymentService.initiatePayment).not.toHaveBeenCalled();
  });

  it("ONLINE: delegates to PaymentService and surfaces the payment URL as awaiting", async () => {
    const paymentService = fakePaymentService();
    const handler = new CheckoutPaymentHandler(paymentService);
    const order = makeOrder();

    const result = await handler.preparePayment("ONLINE", order, "idem-1");

    expect(paymentService.initiatePayment).toHaveBeenCalledWith(order, "idem-1");
    expect(result).toEqual({ paymentUrl: "https://pay.example.com/1", paymentStatus: "awaiting" });
  });

  it("ONLINE: when the provider is unavailable (no payment URL), surfaces a failed status instead of crashing", async () => {
    const paymentService = fakePaymentService({
      initiatePayment: vi.fn(async () => ({ paymentUrl: null, paymentId: "payment-1" })),
    });
    const handler = new CheckoutPaymentHandler(paymentService);

    const result = await handler.preparePayment("ONLINE", makeOrder(), "idem-1");

    expect(result).toEqual({ paymentUrl: null, paymentStatus: "failed" });
  });
});
