import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminFromRequest, getServices } = vi.hoisted(() => ({
  requireAdminFromRequest: vi.fn(),
  getServices: vi.fn(),
}));

vi.mock("@server/auth/resolve-user", () => ({ requireAdminFromRequest }));
vi.mock("@server/di/container", () => ({ getServices }));

const { executeGetPublicContactLinks } = await import("@server/functions/settings.executor");

function withSettings(values: Record<string, unknown>) {
  const get = vi.fn(async (key: string) =>
    key in values
      ? { key, value: values[key], category: "contact", updatedBy: null, updatedAt: "" }
      : null,
  );
  getServices.mockReturnValue({ settingsService: { get } });
  return get;
}

describe("executeGetPublicContactLinks", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is anonymous and reads only the two contact keys", async () => {
    const get = withSettings({});
    await executeGetPublicContactLinks();
    expect(requireAdminFromRequest).not.toHaveBeenCalled();
    expect(get.mock.calls.map((call) => call[0]).sort()).toEqual([
      "contact_telegram",
      "contact_whatsapp",
    ]);
  });

  it("returns null for both when nothing is set or the values are blank", async () => {
    withSettings({});
    expect(await executeGetPublicContactLinks()).toEqual({ telegram: null, whatsapp: null });
    withSettings({ contact_telegram: "", contact_whatsapp: "   " });
    expect(await executeGetPublicContactLinks()).toEqual({ telegram: null, whatsapp: null });
  });

  it("returns each link independently, normalized to https", async () => {
    withSettings({ contact_telegram: "@kantbazar" });
    expect(await executeGetPublicContactLinks()).toEqual({
      telegram: "https://t.me/kantbazar",
      whatsapp: null,
    });
    withSettings({ contact_whatsapp: "+996 555 123 456" });
    expect(await executeGetPublicContactLinks()).toEqual({
      telegram: null,
      whatsapp: "https://wa.me/996555123456",
    });
  });

  it("never lets a non-https / junk stored value through", async () => {
    withSettings({ contact_telegram: "javascript:alert(1)", contact_whatsapp: 42 });
    expect(await executeGetPublicContactLinks()).toEqual({ telegram: null, whatsapp: null });
  });
});
