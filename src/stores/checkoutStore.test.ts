import { beforeAll, describe, expect, it } from "vitest";

// Node test environment has no localStorage — a minimal in-memory stand-in,
// installed before the store module (and its persist middleware) loads.
const memory = new Map<string, string>();
beforeAll(() => {
  globalThis.localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => void memory.set(key, value),
    removeItem: (key: string) => void memory.delete(key),
    clear: () => memory.clear(),
    key: () => null,
    length: 0,
  } as Storage;
});

describe("useCheckoutStore payment method default", () => {
  it("preselects cash, and reset() after an order brings cash back", async () => {
    const { useCheckoutStore } = await import("@/stores/checkoutStore");

    expect(useCheckoutStore.getState().paymentMethod).toBe("CASH");
    useCheckoutStore.getState().setPaymentMethod("ONLINE");
    expect(useCheckoutStore.getState().paymentMethod).toBe("ONLINE");
    useCheckoutStore.getState().reset();
    expect(useCheckoutStore.getState().paymentMethod).toBe("CASH");
  });

  it("turns a draft saved before cash was the default (paymentMethod null) into cash", async () => {
    const { useCheckoutStore } = await import("@/stores/checkoutStore");
    memory.set(
      "platform-checkout",
      JSON.stringify({ state: { paymentMethod: null, guestPhone: "996700000000" }, version: 0 }),
    );

    await useCheckoutStore.persist.rehydrate();

    expect(useCheckoutStore.getState().paymentMethod).toBe("CASH");
    expect(useCheckoutStore.getState().guestPhone).toBe("996700000000");
  });

  it("keeps a saved online choice", async () => {
    const { useCheckoutStore } = await import("@/stores/checkoutStore");
    memory.set(
      "platform-checkout",
      JSON.stringify({ state: { paymentMethod: "ONLINE" }, version: 0 }),
    );

    await useCheckoutStore.persist.rehydrate();

    expect(useCheckoutStore.getState().paymentMethod).toBe("ONLINE");
  });
});

describe("useCheckoutStore guest contact (device-local guest profile)", () => {
  it("persists name/phone/address/zone to localStorage and keeps them across reset()", async () => {
    const { useCheckoutStore } = await import("@/stores/checkoutStore");

    useCheckoutStore.getState().setGuestContact({
      name: "Айгуль",
      phone: "996700111222",
      address: "с. Кара-Жыгач, ул. Ленина 5",
      zoneId: "zone-1",
    });
    useCheckoutStore.getState().setNotes("позвонить заранее");
    useCheckoutStore.getState().reset();

    const state = useCheckoutStore.getState();
    expect(state.guestName).toBe("Айгуль");
    expect(state.guestPhone).toBe("996700111222");
    expect(state.guestAddress).toBe("с. Кара-Жыгач, ул. Ленина 5");
    expect(state.guestZoneId).toBe("zone-1");
    expect(state.notes).toBe("");

    const persisted = JSON.parse(memory.get("platform-checkout") ?? "{}") as {
      state: Record<string, unknown>;
    };
    expect(persisted.state).toMatchObject({
      guestName: "Айгуль",
      guestPhone: "996700111222",
      guestAddress: "с. Кара-Жыгач, ул. Ленина 5",
      guestZoneId: "zone-1",
    });
  });
});
