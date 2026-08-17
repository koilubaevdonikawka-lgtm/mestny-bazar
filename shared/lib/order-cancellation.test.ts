import { describe, expect, it } from "vitest";
import {
  CUSTOMER_CANCELLATION_WINDOW_MS,
  formatCountdown,
  getCancellationRemainingMs,
  isWithinCancellationWindow,
} from "@shared/lib/order-cancellation";

const CREATED_AT = "2026-01-01T00:00:00.000Z";
const CREATED_MS = new Date(CREATED_AT).getTime();

describe("getCancellationRemainingMs", () => {
  it("returns the full window right at creation", () => {
    expect(getCancellationRemainingMs(CREATED_AT, CREATED_MS)).toBe(
      CUSTOMER_CANCELLATION_WINDOW_MS,
    );
  });

  it("counts down as time passes", () => {
    expect(getCancellationRemainingMs(CREATED_AT, CREATED_MS + 30_000)).toBe(90_000);
    expect(getCancellationRemainingMs(CREATED_AT, CREATED_MS + 119_000)).toBe(1_000);
  });

  it("is exactly zero at the boundary", () => {
    expect(
      getCancellationRemainingMs(CREATED_AT, CREATED_MS + CUSTOMER_CANCELLATION_WINDOW_MS),
    ).toBe(0);
  });

  it("clamps to zero, never negative, once the window has passed", () => {
    expect(getCancellationRemainingMs(CREATED_AT, CREATED_MS + 10 * 60 * 1000)).toBe(0);
  });
});

describe("isWithinCancellationWindow", () => {
  it("is true anywhere strictly inside the window", () => {
    expect(isWithinCancellationWindow(CREATED_AT, CREATED_MS)).toBe(true);
    expect(isWithinCancellationWindow(CREATED_AT, CREATED_MS + 119_999)).toBe(true);
  });

  it("is false exactly at the boundary and beyond", () => {
    expect(
      isWithinCancellationWindow(CREATED_AT, CREATED_MS + CUSTOMER_CANCELLATION_WINDOW_MS),
    ).toBe(false);
    expect(isWithinCancellationWindow(CREATED_AT, CREATED_MS + 10 * 60 * 1000)).toBe(false);
  });
});

describe("formatCountdown", () => {
  it("formats the full window as 2:00", () => {
    expect(formatCountdown(CUSTOMER_CANCELLATION_WINDOW_MS)).toBe("2:00");
  });

  it("formats sub-minute remainders with zero-padded seconds", () => {
    expect(formatCountdown(37_000)).toBe("0:37");
    expect(formatCountdown(5_000)).toBe("0:05");
  });

  it("formats zero as 0:00", () => {
    expect(formatCountdown(0)).toBe("0:00");
  });

  it("never produces a negative display, even if given a negative input", () => {
    expect(formatCountdown(-5_000)).toBe("0:00");
  });

  it("rounds up to the next full second so the display never flashes to 0:00 early", () => {
    expect(formatCountdown(1_500)).toBe("0:02");
    expect(formatCountdown(500)).toBe("0:01");
  });
});
