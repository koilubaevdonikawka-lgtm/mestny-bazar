import { describe, expect, it } from "vitest";
import { mapCartItemRow } from "@server/adapters/supabase/cart.repository";

describe("mapCartItemRow", () => {
  it("maps a product_id-identified row", () => {
    expect(
      mapCartItemRow({
        product_id: "prod-1",
        product_slug: null,
        quantity: 2,
        name: "Молоко",
        price: 100,
        currency: "KGS",
        image_url: null,
      }),
    ).toEqual({
      productId: "prod-1",
      productSlug: undefined,
      quantity: 2,
      name: "Молоко",
      price: 100,
      currency: "KGS",
      imageUrl: null,
    });
  });

  it("maps a product_slug-identified row (no synced platform product yet)", () => {
    expect(
      mapCartItemRow({
        product_id: null,
        product_slug: "moloko",
        quantity: 1,
        name: "Молоко",
        price: 100,
        currency: "KGS",
        image_url: "https://example.com/x.jpg",
      }),
    ).toEqual({
      productId: undefined,
      productSlug: "moloko",
      quantity: 1,
      name: "Молоко",
      price: 100,
      currency: "KGS",
      imageUrl: "https://example.com/x.jpg",
    });
  });
});
