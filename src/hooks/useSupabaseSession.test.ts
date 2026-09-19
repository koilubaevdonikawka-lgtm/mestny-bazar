import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

const { watchSession } = await import("@/hooks/useSupabaseSession");

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("watchSession (Задача №282)", () => {
  it("reports authenticated / unauthenticated from a resolved getSession, as before", async () => {
    const onResolved = vi.fn();
    watchSession(
      vi
        .fn()
        .mockResolvedValueOnce({ data: { session: { user: { id: "u" } } } })
        .mockResolvedValueOnce({ data: { session: null } }),
      onResolved,
      vi.fn(),
      new EventTarget(),
    );
    await flush();
    expect(onResolved).toHaveBeenCalledWith(true);

    const onResolved2 = vi.fn();
    watchSession(
      vi.fn().mockResolvedValue({ data: { session: null } }),
      onResolved2,
      vi.fn(),
      new EventTarget(),
    );
    await flush();
    expect(onResolved2).toHaveBeenCalledWith(false);
  });

  it("calls onFailed — not leaving the state pending — when getSession rejects", async () => {
    const onResolved = vi.fn();
    const onFailed = vi.fn();
    watchSession(
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
      onResolved,
      onFailed,
      new EventTarget(),
    );
    await flush();
    expect(onFailed).toHaveBeenCalledTimes(1);
    expect(onResolved).not.toHaveBeenCalled();
  });

  it("re-checks on the 'online' event and recovers to the real session state", async () => {
    const target = new EventTarget();
    const getSession = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({ data: { session: { user: { id: "u" } } } });
    const onResolved = vi.fn();
    const onFailed = vi.fn();
    watchSession(getSession, onResolved, onFailed, target);
    await flush();
    expect(onFailed).toHaveBeenCalledTimes(1);

    target.dispatchEvent(new Event("online"));
    await flush();

    expect(getSession).toHaveBeenCalledTimes(2);
    expect(onResolved).toHaveBeenCalledWith(true);
  });

  it("cleanup removes the listener and drops results of an in-flight check", async () => {
    const target = new EventTarget();
    let resolveSession!: (value: { data: { session: null } }) => void;
    const getSession = vi.fn(
      () =>
        new Promise<{ data: { session: null } }>((resolve) => {
          resolveSession = resolve;
        }),
    );
    const onResolved = vi.fn();
    const stop = watchSession(getSession, onResolved, vi.fn(), target);

    stop();
    resolveSession({ data: { session: null } });
    target.dispatchEvent(new Event("online"));
    await flush();

    expect(onResolved).not.toHaveBeenCalled();
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it("is SSR-safe: works with no event target", async () => {
    const onResolved = vi.fn();
    const stop = watchSession(
      vi.fn().mockResolvedValue({ data: { session: null } }),
      onResolved,
      vi.fn(),
      undefined,
    );
    await flush();
    expect(onResolved).toHaveBeenCalledWith(false);
    expect(() => stop()).not.toThrow();
  });
});
