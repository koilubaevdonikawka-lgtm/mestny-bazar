import { describe, expect, it } from "vitest";
import { mapSettingRow } from "@server/adapters/supabase/settings.repository";

describe("mapSettingRow", () => {
  it("maps a scalar jsonb value", () => {
    expect(
      mapSettingRow({
        key: "store.name",
        value: "Местный Базар",
        category: "general",
        updated_by: "admin-1",
        updated_at: "2026-08-01T00:00:00.000Z",
      }),
    ).toEqual({
      key: "store.name",
      value: "Местный Базар",
      category: "general",
      updatedBy: "admin-1",
      updatedAt: "2026-08-01T00:00:00.000Z",
    });
  });

  it("maps an object jsonb value", () => {
    expect(
      mapSettingRow({
        key: "checkout.buffer",
        value: { windowMs: 120000, enabled: true },
        category: "orders",
        updated_by: null,
        updated_at: "2026-08-01T00:00:00.000Z",
      }),
    ).toEqual({
      key: "checkout.buffer",
      value: { windowMs: 120000, enabled: true },
      category: "orders",
      updatedBy: null,
      updatedAt: "2026-08-01T00:00:00.000Z",
    });
  });

  it("preserves a null updated_by (system-seeded setting, never touched by an admin)", () => {
    const mapped = mapSettingRow({
      key: "feature.flag",
      value: false,
      category: "flags",
      updated_by: null,
      updated_at: "2026-08-01T00:00:00.000Z",
    });

    expect(mapped.updatedBy).toBeNull();
  });
});
