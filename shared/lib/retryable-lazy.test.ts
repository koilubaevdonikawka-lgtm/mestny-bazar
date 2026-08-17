import { describe, expect, it, vi } from "vitest";
import { createRetryableLazy } from "./retryable-lazy";

describe("createRetryableLazy", () => {
  it("calls the factory only once for repeated successful calls", async () => {
    const factory = vi.fn(async () => "value");
    const lazy = createRetryableLazy(factory);

    const first = await lazy();
    const second = await lazy();

    expect(first).toBe("value");
    expect(second).toBe("value");
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("retries the factory on the next call after a rejection, instead of reusing the dead promise forever", async () => {
    let attempt = 0;
    const factory = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("first attempt fails");
      return "recovered";
    });
    const lazy = createRetryableLazy(factory);

    await expect(lazy()).rejects.toThrow("first attempt fails");
    // The bug this guards against: a naive `if (!cached) cached = factory()`
    // would return that same rejected promise forever here instead of
    // retrying — every call after the first failure would reject identically.
    await expect(lazy()).resolves.toBe("recovered");
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it("concurrent calls while the factory is still pending share the same in-flight promise", async () => {
    const factory = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "value";
    });
    const lazy = createRetryableLazy(factory);

    const [a, b] = await Promise.all([lazy(), lazy()]);

    expect(a).toBe("value");
    expect(b).toBe("value");
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
