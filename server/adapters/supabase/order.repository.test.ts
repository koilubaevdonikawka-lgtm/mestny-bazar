import { describe, expect, it } from "vitest";
import {
  decodePaymentMethodNote,
  encodePaymentMethodNote,
  extractUserNotes,
  mergeNotes,
  sortItemsForAssembly,
} from "@server/adapters/supabase/order.repository";

interface FakeAssemblyItem {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  products: {
    category_id: string | null;
    sort_order: number | null;
    categories: { sort_order: number | null } | null;
  } | null;
}

function fakeItem(overrides: Partial<FakeAssemblyItem> = {}): FakeAssemblyItem {
  return {
    id: "item-1",
    product_id: "prod-1",
    variant_id: null,
    product_name: "Товар",
    product_image_url: null,
    quantity: 1,
    unit_price: 100,
    line_total: 100,
    products: { category_id: "cat-1", sort_order: 1, categories: { sort_order: 1 } },
    ...overrides,
  };
}

function withCategory(categorySortOrder: number, productSortOrder: number | null) {
  return {
    category_id: "cat",
    sort_order: productSortOrder,
    categories: { sort_order: categorySortOrder },
  };
}

describe("payment method note encoding (order notes sideband channel)", () => {
  it("round-trips ONLINE and CASH through merge/decode with no user notes", () => {
    expect(decodePaymentMethodNote(mergeNotes(undefined, "ONLINE"))).toBe("ONLINE");
    expect(decodePaymentMethodNote(mergeNotes(undefined, "CASH"))).toBe("CASH");
  });

  it("round-trips correctly alongside real user notes", () => {
    const merged = mergeNotes("Leave at the door, ring twice", "ONLINE");
    expect(decodePaymentMethodNote(merged)).toBe("ONLINE");
  });

  it("defaults to CASH when there are no notes at all", () => {
    expect(decodePaymentMethodNote(null)).toBe("CASH");
  });

  // Regression test: request.notes is client-controlled free text (CheckoutService
  // passes it straight through). A customer note containing the literal tag text
  // must never be able to spoof the decoded payment method for an order that was
  // actually placed with the other method — this would misreport payment method on
  // every later read (admin/courier/warehouse views, reconciliation).
  it("is not spoofable by user note text containing the tag for the OTHER payment method", () => {
    const spoofAttempt = mergeNotes("Note: payment_method:ONLINE please refund via card", "CASH");
    expect(decodePaymentMethodNote(spoofAttempt)).toBe("CASH");
  });

  it("is not spoofable when the user's note itself ends with a fake tag on its own line", () => {
    const spoofAttempt = mergeNotes("Some note\npayment_method:ONLINE", "CASH");
    expect(decodePaymentMethodNote(spoofAttempt)).toBe("CASH");
  });

  it("still round-trips ONLINE correctly when user notes contain an unrelated CASH-like string", () => {
    const merged = mergeNotes(
      "I'll pay payment_method:CASH style but really paying online",
      "ONLINE",
    );
    expect(decodePaymentMethodNote(merged)).toBe("ONLINE");
  });

  it("falls back to CASH for a raw notes string that never had a real tag appended", () => {
    expect(decodePaymentMethodNote("just a plain customer note")).toBe("CASH");
  });

  it("encodePaymentMethodNote produces the exact tag format decodePaymentMethodNote expects", () => {
    expect(encodePaymentMethodNote("ONLINE")).toBe("payment_method:ONLINE");
    expect(decodePaymentMethodNote(encodePaymentMethodNote("ONLINE"))).toBe("ONLINE");
  });
});

// Задача №274 — extractUserNotes is the inverse of mergeNotes: strips the
// tag back off so the customer's own comment (and only that) is what
// reaches any UI (admin order detail).
describe("extractUserNotes", () => {
  it("strips the trailing payment_method tag, leaving only the user's real note", () => {
    const merged = mergeNotes("Leave at the door, ring twice", "ONLINE");
    expect(extractUserNotes(merged)).toBe("Leave at the door, ring twice");
  });

  it("returns null when the order has no user note at all (tag-only notes column)", () => {
    const merged = mergeNotes(undefined, "CASH");
    expect(extractUserNotes(merged)).toBeNull();
  });

  it("returns null for a null notes column", () => {
    expect(extractUserNotes(null)).toBeNull();
  });

  it("passes a tag-less notes string through unchanged (pre-existing/edge-case data)", () => {
    expect(extractUserNotes("just a plain customer note")).toBe("just a plain customer note");
  });

  it("preserves a user note that ends with its own payment_method-shaped line, since the real tag is always appended after it", () => {
    const merged = mergeNotes("Some note\npayment_method:ONLINE", "CASH");
    expect(extractUserNotes(merged)).toBe("Some note\npayment_method:ONLINE");
  });
});

// Задача №278 — warehouse assembly screen: items grouped by category display
// order, then by the product's own sortOrder within a category.
describe("sortItemsForAssembly", () => {
  it("groups items added out of category order into category display order", () => {
    const items = [
      fakeItem({ id: "a", products: withCategory(3, 1) }),
      fakeItem({ id: "b", products: withCategory(1, 1) }),
      fakeItem({ id: "c", products: withCategory(2, 1) }),
    ];
    expect(sortItemsForAssembly(items).map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("orders items within the same category by the product's sortOrder", () => {
    const items = [
      fakeItem({ id: "a", products: withCategory(1, 30) }),
      fakeItem({ id: "b", products: withCategory(1, 10) }),
      fakeItem({ id: "c", products: withCategory(1, 20) }),
    ];
    expect(sortItemsForAssembly(items).map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("sends an item with no resolvable category to the end instead of breaking the sort", () => {
    const items = [
      fakeItem({ id: "numbered", products: withCategory(1, 1) }),
      fakeItem({ id: "deleted-product", product_id: null, products: null }),
      fakeItem({
        id: "no-category",
        products: { category_id: null, sort_order: 5, categories: null },
      }),
    ];
    const result = sortItemsForAssembly(items);
    expect(result.map((i) => i.id)).toEqual(["numbered", "deleted-product", "no-category"]);
  });

  it("puts a product with no sortOrder last within its own category, matching the catalog's nullsFirst:false convention", () => {
    const items = [
      fakeItem({ id: "unnumbered", products: withCategory(1, null) }),
      fakeItem({ id: "numbered", products: withCategory(1, 5) }),
    ];
    expect(sortItemsForAssembly(items).map((i) => i.id)).toEqual(["numbered", "unnumbered"]);
  });

  it("never throws and preserves original relative order among multiple unresolved items", () => {
    const items = [
      fakeItem({ id: "x", product_id: null, products: null }),
      fakeItem({ id: "y", product_id: null, products: null }),
    ];
    expect(() => sortItemsForAssembly(items)).not.toThrow();
    expect(sortItemsForAssembly(items).map((i) => i.id)).toEqual(["x", "y"]);
  });
});
