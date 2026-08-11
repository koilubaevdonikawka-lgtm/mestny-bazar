import { describe, expect, it } from "vitest";
import { mapVariantAttributeValueRow } from "@server/adapters/supabase/variant-attribute.repository";

describe("mapVariantAttributeValueRow", () => {
  it("maps a LIST-valued row (e.g. Color=Red)", () => {
    expect(
      mapVariantAttributeValueRow({
        id: "vav-1",
        variant_id: "var-1",
        attribute_id: "attr-color",
        value_text: null,
        value_number: null,
        value_boolean: null,
        attribute_value_id: "val-red",
      }),
    ).toEqual({
      id: "vav-1",
      variantId: "var-1",
      attributeId: "attr-color",
      valueText: null,
      valueNumber: null,
      valueBoolean: null,
      attributeValueId: "val-red",
    });
  });

  it("maps a NUMBER-valued row (e.g. Weight=1.5)", () => {
    const mapped = mapVariantAttributeValueRow({
      id: "vav-2",
      variant_id: "var-1",
      attribute_id: "attr-weight",
      value_text: null,
      value_number: 1.5,
      value_boolean: null,
      attribute_value_id: null,
    });
    expect(mapped.valueNumber).toBe(1.5);
    expect(mapped.attributeValueId).toBeNull();
  });
});
