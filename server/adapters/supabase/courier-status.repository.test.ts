import { describe, expect, it } from "vitest";
import { mapCourierStatusRow } from "@server/adapters/supabase/courier-status.repository";

describe("mapCourierStatusRow", () => {
  it("maps an available courier row", () => {
    expect(
      mapCourierStatusRow({
        courier_id: "courier-1",
        is_available: true,
        last_seen_at: "2026-08-01T00:00:00.000Z",
      }),
    ).toEqual({
      courierId: "courier-1",
      isAvailable: true,
      lastSeenAt: "2026-08-01T00:00:00.000Z",
    });
  });

  it("maps an unavailable courier row", () => {
    const mapped = mapCourierStatusRow({
      courier_id: "courier-2",
      is_available: false,
      last_seen_at: "2026-08-01T00:05:00.000Z",
    });

    expect(mapped.isAvailable).toBe(false);
  });
});
