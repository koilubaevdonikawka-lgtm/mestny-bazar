import { describe, expect, it } from "vitest";
import { slugify } from "@shared/lib/slugify";

describe("slugify", () => {
  it("lowercases, trims, and hyphenates a plain name", () => {
    expect(slugify("Fresh Bread", "product")).toBe("fresh-bread");
  });

  it("strips non a-z0-9 characters", () => {
    expect(slugify("Fresh Bread!!", "product")).toBe("fresh-bread");
  });

  it("collapses repeated separators and trims leading/trailing hyphens", () => {
    expect(slugify("  Молочные   продукты -- 2  ", "category")).toBe("2");
  });

  it("falls back to a prefixed timestamp when the name strips to nothing", () => {
    expect(slugify("Свежий Хлеб!!", "product")).toMatch(/^product-\d+$/);
    expect(slugify("Молочные продукты", "category")).toMatch(/^category-\d+$/);
  });

  it("truncates to 80 characters", () => {
    const long = "a".repeat(200);
    expect(slugify(long, "product").length).toBe(80);
  });
});
