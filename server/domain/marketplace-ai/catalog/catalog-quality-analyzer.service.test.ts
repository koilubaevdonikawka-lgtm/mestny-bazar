import { describe, expect, it } from "vitest";
import { CatalogQualityAnalyzerService } from "@server/domain/marketplace-ai/catalog/catalog-quality-analyzer.service";
import type { CatalogProductInput } from "@server/ports/marketplace-ai/catalog-analysis.port";

function fakeProduct(overrides: Partial<CatalogProductInput> = {}): CatalogProductInput {
  return {
    name: "Свежие яблоки Гала",
    description: "Сочные яблоки сорта Гала, привезены сегодня утром с местной фермы",
    price: 120,
    currency: "KGS",
    unit: "kg",
    imageUrl: "https://example.com/apple.jpg",
    categoryId: null,
    stock: 50,
    ...overrides,
  };
}

const analyzer = new CatalogQualityAnalyzerService();

describe("CatalogQualityAnalyzerService", () => {
  describe("name analysis", () => {
    it("flags a name below the minimum length", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct({ name: "ab" }) });
      expect(result.nameAnalysis.issues).toContain("name:too-short(2)");
    });

    it("flags a name above the maximum length", () => {
      const longName = "a".repeat(121);
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({ name: longName }),
      });
      expect(result.nameAnalysis.issues).toContain(`name:too-long(${longName.length})`);
    });

    it("flags a whitespace-only name as empty", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct({ name: "   " }) });
      expect(result.nameAnalysis.issues).toContain("name:empty");
    });

    it("flags a purely numeric name", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct({ name: "12345" }) });
      expect(result.nameAnalysis.issues).toContain("name:numeric-only");
    });

    it("passes a well-formed name with no issues", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct() });
      expect(result.nameAnalysis.issues).toEqual([]);
      expect(result.checks.name.passed).toBe(true);
    });
  });

  describe("description analysis", () => {
    it("flags a missing description", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({ description: null }),
      });
      expect(result.descriptionAnalysis.issues).toContain("description:missing");
    });

    it("flags a description shorter than the minimum", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({ description: "short" }),
      });
      expect(result.descriptionAnalysis.issues).toContain("description:too-short(5)");
    });

    it("passes a sufficiently long description", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct() });
      expect(result.descriptionAnalysis.issues).toEqual([]);
    });
  });

  describe("required fields", () => {
    it("reports 100% completeness when all required fields are present", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct() });
      expect(result.checks.requiredFields.completenessPercent).toBe(100);
      expect(result.checks.requiredFields.missing).toEqual([]);
    });

    it("lists missing fields and computes partial completeness", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({ price: null, imageUrl: null }),
      });
      expect(result.checks.requiredFields.missing.sort()).toEqual(["imageUrl", "price"]);
      expect(result.checks.requiredFields.completenessPercent).toBe(50);
    });

    it("treats a zero or negative price as missing", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct({ price: 0 }) });
      expect(result.checks.requiredFields.missing).toContain("price");
    });
  });

  describe("category detection", () => {
    it("suggests a category when name/description keywords match the dictionary", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct() });
      expect(result.recommendations.suggestedCategory?.categorySlug).toBe("produce");
    });

    it("suggests the matching subcategory within the detected category", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct() });
      expect(result.recommendations.suggestedSubcategory?.subcategorySlug).toBe("fruits");
    });

    it("returns no suggestion when nothing in the corpus matches any keyword", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({ name: "xyz", description: "qqqqqqqqqqqqqqqqqqqq" }),
      });
      expect(result.recommendations.suggestedCategory).toBeNull();
      expect(result.recommendations.suggestedSubcategory).toBeNull();
    });

    it("picks the category with more matched keywords when several match", () => {
      // "молок" -> dairy (1 keyword), "овощ"+"морков"+"картоф" -> produce (3 keywords, higher confidence)
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({
          name: "Молоко и овощи",
          description: "картофель, морковь и молоко в одной коробке для дома",
        }),
      });
      expect(result.recommendations.suggestedCategory?.categorySlug).toBe("produce");
    });

    it("category check fails to match the suggestion once one is detected (categoryId is never cross-referenced)", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({ categoryId: "produce" }),
      });
      expect(result.checks.category.assigned).toBe(true);
      expect(result.checks.category.matchesSuggestion).toBe(false);
      expect(result.checks.category.passed).toBe(false);
    });

    it("category check passes when no category is assigned and none is suggested", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({
          name: "xyz",
          description: "qqqqqqqqqqqqqqqqqqqq",
          categoryId: null,
        }),
      });
      expect(result.checks.category.assigned).toBe(false);
      expect(result.checks.category.matchesSuggestion).toBe(true);
      expect(result.checks.category.passed).toBe(false);
    });
  });

  describe("tags and characteristics", () => {
    it("generates deduplicated tags capped at 8, excluding stop words and short tokens", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct() });
      expect(result.recommendations.suggestedTags.length).toBeLessThanOrEqual(8);
      expect(new Set(result.recommendations.suggestedTags).size).toBe(
        result.recommendations.suggestedTags.length,
      );
      expect(result.recommendations.suggestedTags).not.toContain("и");
    });

    it("includes the product unit as a tag when the token budget allows it", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({ name: "Груша", description: "Просто груша", unit: "KG" }),
      });
      expect(result.recommendations.suggestedTags).toContain("kg");
    });

    it("detects organic/fresh/frozen characteristics from the corpus", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({
          name: "Органические свежие яблоки",
          description: "нужна заморозка для хранения, только свежие и органик",
        }),
      });
      expect(result.recommendations.suggestedCharacteristics.organic).toBe("yes");
      expect(result.recommendations.suggestedCharacteristics.fresh).toBe("yes");
      expect(result.recommendations.suggestedCharacteristics.frozen).toBe("yes");
    });

    it("carries unit, currency and stock into characteristics", () => {
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct() });
      expect(result.recommendations.suggestedCharacteristics.unit).toBe("kg");
      expect(result.recommendations.suggestedCharacteristics.currency).toBe("KGS");
      expect(result.recommendations.suggestedCharacteristics.stock).toBe("50");
    });
  });

  describe("catalogScore", () => {
    it("scores a fully complete, high-quality product at 100 minus only the unassigned-category penalty", () => {
      // fakeProduct() leaves categoryId unset — the -10 "not assigned" penalty applies
      // regardless of whether a category was auto-suggested from the corpus.
      const result = analyzer.analyze({ productId: "p1", product: fakeProduct() });
      expect(result.catalogScore).toBe(90);
    });

    it("costs only 5 points (mismatch, not unassigned) once a categoryId is actually set", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({ categoryId: "produce" }),
      });
      expect(result.catalogScore).toBe(95);
    });

    it("never scores below 0 even with every penalty stacked", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: {
          name: "1",
          description: null,
          price: null,
          currency: null,
          imageUrl: null,
          unit: null,
          categoryId: null,
          stock: null,
        },
      });
      expect(result.catalogScore).toBe(0);
    });

    it("still applies the unassigned-category penalty when no category is suggested either", () => {
      const result = analyzer.analyze({
        productId: "p1",
        product: fakeProduct({
          name: "Товар для дома",
          description: "Полезный товар для дома и семьи каждый день по хорошей цене",
          categoryId: null,
        }),
      });
      expect(result.recommendations.suggestedCategory).toBeNull();
      expect(result.catalogScore).toBe(90);
    });
  });
});
