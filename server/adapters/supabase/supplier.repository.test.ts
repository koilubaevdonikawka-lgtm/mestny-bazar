import { describe, expect, it } from "vitest";
import { mapSupplierRow } from "@server/adapters/supabase/supplier.repository";

describe("mapSupplierRow", () => {
  it("maps a full row", () => {
    expect(
      mapSupplierRow({
        id: "supplier-1",
        name: "ОсОО Молоко",
        contact_phone: "+996700000000",
        contact_person: "Иван",
        notes: "Доставка по вторникам",
        is_active: true,
      }),
    ).toEqual({
      id: "supplier-1",
      name: "ОсОО Молоко",
      contactPhone: "+996700000000",
      contactPerson: "Иван",
      notes: "Доставка по вторникам",
      isActive: true,
    });
  });

  it("preserves null optional fields and an inactive supplier", () => {
    const mapped = mapSupplierRow({
      id: "supplier-2",
      name: "Inactive Co",
      contact_phone: null,
      contact_person: null,
      notes: null,
      is_active: false,
    });

    expect(mapped.contactPhone).toBeNull();
    expect(mapped.isActive).toBe(false);
  });
});
