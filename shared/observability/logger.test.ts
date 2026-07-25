import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";
import { getRequestId, runWithRequestContext } from "./request-context";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes structured JSON with level, message, and timestamp", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("hello", { foo: "bar" });

    expect(spy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry).toMatchObject({ level: "info", message: "hello", foo: "bar" });
    expect(typeof entry.timestamp).toBe("string");
  });

  it("includes the current request id when called inside runWithRequestContext", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    runWithRequestContext("req-123", () => {
      logger.warn("something odd");
    });

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry.requestId).toBe("req-123");
  });

  it("omits requestId when called outside any request context", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("no context here");

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry.requestId).toBeUndefined();
  });

  it("serializes an Error's message and stack under the error key", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("failed", { error: new Error("boom") });

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry.error).toMatchObject({ message: "boom" });
    expect(typeof entry.error.stack).toBe("string");
  });

  it("serializes a non-Error rejection reason as a string message", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("failed", { error: "plain string reason" });

    const entry = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(entry.error).toEqual({ message: "plain string reason" });
  });

  it("routes each level to its matching console method", () => {
    const infoSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.info("i");
    logger.warn("w");
    logger.error("e");

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});

describe("request-context", () => {
  it("returns undefined outside any runWithRequestContext call", () => {
    expect(getRequestId()).toBeUndefined();
  });

  it("scopes the request id to the callback and its async continuations", async () => {
    const observed: Array<string | undefined> = [];

    await Promise.all([
      runWithRequestContext("req-a", async () => {
        await Promise.resolve();
        observed.push(getRequestId());
      }),
      runWithRequestContext("req-b", async () => {
        await Promise.resolve();
        observed.push(getRequestId());
      }),
    ]);

    expect(observed.sort()).toEqual(["req-a", "req-b"]);
  });
});
