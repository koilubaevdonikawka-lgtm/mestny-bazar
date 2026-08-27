import { afterEach, describe, expect, it, vi } from "vitest";

const { getServices } = vi.hoisted(() => ({ getServices: vi.fn() }));

vi.mock("@server/di/container", () => ({ getServices }));

const { executeCheckPaymentStatus, OrderNotFoundError } =
  await import("@server/functions/payment.executor");

function fakeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    status: "CREATED",
    paymentMethod: "CASH",
    paymentStatus: "unpaid",
    ...overrides,
  };
}

describe("executeCheckPaymentStatus (Задача №186)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("throws OrderNotFoundError when the order doesn't exist", async () => {
    getServices.mockReturnValue({
      orderService: { getOrder: vi.fn(async () => null) },
      paymentRepository: { getByOrderId: vi.fn() },
      paymentService: { recheckStatus: vi.fn() },
    });

    await expect(executeCheckPaymentStatus("missing")).rejects.toBeInstanceOf(OrderNotFoundError);
  });

  it("reports the order's own paymentMethod for a CASH order with no payment record, pending until courier collection", async () => {
    getServices.mockReturnValue({
      orderService: { getOrder: vi.fn(async () => fakeOrder({ paymentMethod: "CASH" })) },
      paymentRepository: { getByOrderId: vi.fn(async () => null) },
      paymentService: { recheckStatus: vi.fn() },
    });

    const result = await executeCheckPaymentStatus("order-1");

    expect(result).toEqual({ status: "pending", orderStatus: "CREATED", paymentMethod: "CASH" });
  });

  it("reports paid for a CASH order the courier already marked paid, still with no payment record", async () => {
    getServices.mockReturnValue({
      orderService: {
        getOrder: vi.fn(async () => fakeOrder({ paymentMethod: "CASH", paymentStatus: "paid" })),
      },
      paymentRepository: { getByOrderId: vi.fn(async () => null) },
      paymentService: { recheckStatus: vi.fn() },
    });

    const result = await executeCheckPaymentStatus("order-1");

    expect(result).toEqual({ status: "paid", orderStatus: "CREATED", paymentMethod: "CASH" });
  });

  it("reconciles via paymentService and still surfaces paymentMethod for an ONLINE order with a payment record", async () => {
    const recheckStatus = vi.fn(async () => ({ status: "failed" }));
    getServices.mockReturnValue({
      orderService: { getOrder: vi.fn(async () => fakeOrder({ paymentMethod: "ONLINE" })) },
      paymentRepository: { getByOrderId: vi.fn(async () => ({ id: "payment-1" })) },
      paymentService: { recheckStatus },
    });

    const result = await executeCheckPaymentStatus("order-1");

    expect(recheckStatus).toHaveBeenCalledWith("payment-1");
    expect(result).toEqual({ status: "failed", orderStatus: "CREATED", paymentMethod: "ONLINE" });
  });
});
