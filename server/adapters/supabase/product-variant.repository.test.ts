import { describe, expect, it } from "vitest";
import { mapProductVariantRow } from "@server/adapters/supabase/product-variant.repository";

describe("mapProductVariantRow", () => {
  it("maps a variant row with its own price and image", () => {
    expect(
      mapProductVariantRow({
        id: "var-1",
        product_id: "prod-1",
        sku: "SKU-RED-L",
        price: 499.99,
        image_url: "https://example.com/red-l.jpg",
        publication_status: "PUBLISHED",
        sort_order: 0,
      }),
    ).toEqual({
      id: "var-1",
      productId: "prod-1",
      sku: "SKU-RED-L",
      price: 499.99,
      imageUrl: "https://example.com/red-l.jpg",
      publicationStatus: "PUBLISHED",
      sortOrder: 0,
    });
  });

  it("maps a variant that inherits the parent product's price/image (both null)", () => {
    const mapped = mapProductVariantRow({
      id: "var-2",
      product_id: "prod-1",
      sku: "SKU-BLUE-M",
      price: null,
      image_url: null,
      publication_status: "DRAFT",
      sort_order: 1,
    });
    expect(mapped.price).toBeNull();
    expect(mapped.imageUrl).toBeNull();
  });
});
