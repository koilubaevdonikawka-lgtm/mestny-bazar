import { afterEach, describe, expect, it, vi } from "vitest";

const { isNativePlatform } = vi.hoisted(() => ({ isNativePlatform: vi.fn(() => false) }));
vi.mock("@/lib/capabilities/platform", () => ({ isNativePlatform }));

const { addListener, removeHandle } = vi.hoisted(() => ({
  addListener: vi.fn(),
  removeHandle: vi.fn(async () => {}),
}));
vi.mock("@capacitor/app", () => ({ App: { addListener } }));

const { setupForegroundListener } = await import("@/hooks/useResetOnAppForeground");

interface FakeDocument extends EventTarget {
  visibilityState: "visible" | "hidden";
}

function makeFakeDocument(initialState: "visible" | "hidden"): FakeDocument {
  return Object.assign(new EventTarget(), { visibilityState: initialState });
}

function stubDocument(doc: FakeDocument): void {
  vi.stubGlobal("document", doc as unknown as Document);
}

describe("setupForegroundListener", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    isNativePlatform.mockReturnValue(false);
  });

  it("SSR-safe: returns a no-op cleanup and touches nothing when document is undefined", () => {
    vi.stubGlobal("document", undefined);

    const onForeground = vi.fn();
    const cleanup = setupForegroundListener(onForeground);
    cleanup();

    expect(onForeground).not.toHaveBeenCalled();
    expect(isNativePlatform).not.toHaveBeenCalled();
    expect(addListener).not.toHaveBeenCalled();
  });

  it("fires onForeground on a hidden -> visible visibilitychange", () => {
    const doc = makeFakeDocument("hidden");
    stubDocument(doc);
    const onForeground = vi.fn();

    setupForegroundListener(onForeground);
    doc.visibilityState = "visible";
    doc.dispatchEvent(new Event("visibilitychange"));

    expect(onForeground).toHaveBeenCalledTimes(1);
  });

  it("does not fire onForeground on a visible -> hidden visibilitychange", () => {
    const doc = makeFakeDocument("visible");
    stubDocument(doc);
    const onForeground = vi.fn();

    setupForegroundListener(onForeground);
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));

    expect(onForeground).not.toHaveBeenCalled();
  });

  it("cleanup removes the visibilitychange listener — no further calls after teardown", () => {
    const doc = makeFakeDocument("hidden");
    stubDocument(doc);
    const onForeground = vi.fn();

    const cleanup = setupForegroundListener(onForeground);
    cleanup();

    doc.visibilityState = "visible";
    doc.dispatchEvent(new Event("visibilitychange"));

    expect(onForeground).not.toHaveBeenCalled();
  });

  it("never imports/touches @capacitor/app when isNativePlatform() is false", async () => {
    isNativePlatform.mockReturnValue(false);
    vi.stubGlobal("document", makeFakeDocument("hidden"));

    setupForegroundListener(vi.fn());
    await vi.waitFor(() => {}); // let any pending microtasks flush

    expect(addListener).not.toHaveBeenCalled();
  });

  it("on native platforms, fires onForeground when appStateChange reports isActive: true", async () => {
    isNativePlatform.mockReturnValue(true);
    vi.stubGlobal("document", makeFakeDocument("hidden"));
    let capturedListener: ((state: { isActive: boolean }) => void) | undefined;
    addListener.mockImplementation((_event: string, listener: typeof capturedListener) => {
      capturedListener = listener;
      return Promise.resolve({ remove: removeHandle });
    });

    const onForeground = vi.fn();
    setupForegroundListener(onForeground);
    await vi.waitFor(() => expect(capturedListener).toBeDefined());

    capturedListener?.({ isActive: false });
    expect(onForeground).not.toHaveBeenCalled();

    capturedListener?.({ isActive: true });
    expect(onForeground).toHaveBeenCalledTimes(1);
  });

  it("cleanup removes the native listener once it has attached", async () => {
    isNativePlatform.mockReturnValue(true);
    vi.stubGlobal("document", makeFakeDocument("hidden"));
    addListener.mockResolvedValue({ remove: removeHandle });

    const cleanup = setupForegroundListener(vi.fn());
    await vi.waitFor(() => expect(addListener).toHaveBeenCalled());
    cleanup();
    await vi.waitFor(() => expect(removeHandle).toHaveBeenCalledTimes(1));
  });
});
