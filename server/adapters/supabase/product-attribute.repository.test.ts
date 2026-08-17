import { describe, expect, it } from "vitest";
import { mapProductAttributeValueRow } from "@server/adapters/supabase/product-attribute.repository";

describe("mapProductAttributeValueRow", () => {
  it("maps a NUMBER-valued row", () => {
    expect(
      mapProductAttributeValueRow({
        id: "pav-1",
        product_id: "prod-1",
        attribute_id: "attr-weight",
        value_text: null,
        value_number: 1.5,
        value_boolean: null,
        attribute_value_id: null,
      }),
    ).toEqual({
      id: "pav-1",
      productId: "prod-1",
      attributeId: "attr-weight",
      valueText: null,
      valueNumber: 1.5,
      valueBoolean: null,
      attributeValueId: null,
    });
  });

  it("maps a LIST-valued row", () => {
    const mapped = mapProductAttributeValueRow({
      id: "pav-2",
      product_id: "prod-1",
      attribute_id: "attr-color",
      value_text: null,
      value_number: null,
      value_boolean: null,
      attribute_value_id: "val-red",
    });
    expect(mapped.attributeValueId).toBe("val-red");
    expect(mapped.valueNumber).toBeNull();
  });
});
