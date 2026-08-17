import { afterEach, describe, expect, it, vi } from "vitest";

const { getServices } = vi.hoisted(() => ({ getServices: vi.fn() }));

vi.mock("@server/di/container", () => ({ getServices }));

const { executeSweepExpiredPayments } = await import("@server/functions/payment-sweep.executor");

function fakePayment(id: string) {
  return { id, orderId: `order-${id}`, status: "awaiting" } as never;
}

describe("payment-sweep.executor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sweeps every candidate and reports how many actually transitioned to expired", async () => {
    const candidates = [fakePayment("p1"), fakePayment("p2"), fakePayment("p3")];
    const checkExpiry = vi.fn(async (payment: { id: string }) => {
      // p2 is not actually past expiry yet (checkExpiry re-validates internally) — stays as-is.
      if (payment.id === "p2") return { ...payment, status: "awaiting" };
      return { ...payment, status: "expired" };
    });
    getServices.mockReturnValue({
      paymentRepository: { listExpiredPending: vi.fn(async () => candidates) },
      paymentService: { checkExpiry },
    });

    const result = await executeSweepExpiredPayments();

    expect(checkExpiry).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ scanned: 3, swept: 2, failed: 0 });
  });

  it("isolates a single item's failure — one broken payment doesn't abort the rest of the batch", async () => {
    const candidates = [fakePayment("p1"), fakePayment("p2")];
    const checkExpiry = vi.fn(async (payment: { id: string }) => {
      if (payment.id === "p1") throw new Error("db unavailable");
      return { ...payment, status: "expired" };
    });
    getServices.mockReturnValue({
      paymentRepository: { listExpiredPending: vi.fn(async () => candidates) },
      paymentService: { checkExpiry },
    });

    const result = await executeSweepExpiredPayments();

    expect(checkExpiry).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ scanned: 2, swept: 1, failed: 1 });
  });

  it("no candidates — returns a clean zero result without calling checkExpiry", async () => {
    const checkExpiry = vi.fn();
    getServices.mockReturnValue({
      paymentRepository: { listExpiredPending: vi.fn(async () => []) },
      paymentService: { checkExpiry },
    });

    const result = await executeSweepExpiredPayments();

    expect(checkExpiry).not.toHaveBeenCalled();
    expect(result).toEqual({ scanned: 0, swept: 0, failed: 0 });
  });
});
