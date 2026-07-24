import {
  CATEGORY_DICTIONARY,
  STOP_WORDS,
} from "@server/domain/marketplace-ai/catalog/category-dictionary";
import {
  CATALOG_REQUIRED_FIELDS,
  type CatalogAnalysisRecommendations,
  type CatalogAnalysisResult,
  type CatalogCategorySuggestion,
  type CatalogDescriptionAnalysis,
  type CatalogNameAnalysis,
  type CatalogProductInput,
  type CatalogSubcategorySuggestion,
  type ICatalogQualityAnalyzer,
} from "@server/ports/marketplace-ai/catalog-analysis.port";

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 120;
const MIN_DESCRIPTION_LENGTH = 20;

/** Rule-based catalog analyzer — recommendations only, no publication decisions. */
export class CatalogQualityAnalyzerService implements ICatalogQualityAnalyzer {
  analyze(input: { productId: string | null; product: CatalogProductInput }): CatalogAnalysisResult {
    const { productId, product } = input;
    const nameAnalysis = this.analyzeName(product.name);
    const descriptionAnalysis = this.analyzeDescription(product.description ?? null);
    const requiredFields = this.checkRequiredFields(product);
    const hasPhoto = Boolean(product.imageUrl?.trim());
    const recommendations = this.buildRecommendations(product);
    const categoryAssigned = Boolean(product.categoryId?.trim());
    const matchesSuggestion =
      !recommendations.suggestedCategory ||
      recommendations.suggestedCategory.categorySlug === this.inferAssignedCategorySlug(product.categoryId);

    const checks = {
      name: { passed: nameAnalysis.issues.length === 0, issues: nameAnalysis.issues },
      description: {
        passed: descriptionAnalysis.issues.length === 0,
        issues: descriptionAnalysis.issues,
      },
      requiredFields,
      photos: { passed: hasPhoto, hasPhoto },
      category: {
        passed: categoryAssigned && matchesSuggestion,
        assigned: categoryAssigned,
        matchesSuggestion,
      },
    };

    return {
      productId,
      catalogScore: this.calculateCatalogScore(checks),
      nameAnalysis,
      descriptionAnalysis,
      checks,
      recommendations,
    };
  }

  private analyzeName(name: string): CatalogNameAnalysis {
    const value = name.trim();
    const wordCount = this.countWords(value);
    const issues: string[] = [];

    if (value.length < MIN_NAME_LENGTH) {
      issues.push(`name:too-short(${value.length})`);
    }
    if (value.length > MAX_NAME_LENGTH) {
      issues.push(`name:too-long(${value.length})`);
    }
    if (wordCount === 0) {
      issues.push("name:empty");
    }
    if (/^\d+$/.test(value)) {
      issues.push("name:numeric-only");
    }

    return { value, wordCount, issues };
  }

  private analyzeDescription(description: string | null): CatalogDescriptionAnalysis {
    const value = description?.trim() ?? null;
    const wordCount = value ? this.countWords(value) : 0;
    const issues: string[] = [];

    if (!value) {
      issues.push("description:missing");
    } else if (value.length < MIN_DESCRIPTION_LENGTH) {
      issues.push(`description:too-short(${value.length})`);
    }

    return { value, wordCount, issues };
  }

  private checkRequiredFields(product: CatalogProductInput) {
    const missing: string[] = [];

    for (const field of CATALOG_REQUIRED_FIELDS) {
      if (!this.isFieldFilled(product, field)) {
        missing.push(field);
      }
    }

    const completenessPercent = Math.round(
      ((CATALOG_REQUIRED_FIELDS.length - missing.length) / CATALOG_REQUIRED_FIELDS.length) * 100,
    );

    return {
      passed: missing.length === 0,
      missing,
      completenessPercent,
    };
  }

  private isFieldFilled(
    product: CatalogProductInput,
    field: (typeof CATALOG_REQUIRED_FIELDS)[number],
  ): boolean {
    switch (field) {
      case "name":
        return Boolean(product.name?.trim());
      case "price":
        return typeof product.price === "number" && product.price > 0;
      case "currency":
        return Boolean(product.currency?.trim());
      case "imageUrl":
        return Boolean(product.imageUrl?.trim());
      default:
        return false;
    }
  }

  private buildRecommendations(product: CatalogProductInput): CatalogAnalysisRecommendations {
    const corpus = `${product.name} ${product.description ?? ""}`.toLowerCase();
    const suggestedCategory = this.detectCategory(corpus);
    const suggestedSubcategory = suggestedCategory
      ? this.detectSubcategory(corpus, suggestedCategory.categorySlug)
      : null;

    return {
      suggestedCategory,
      suggestedSubcategory,
      suggestedTags: this.generateTags(product),
      suggestedCharacteristics: this.generateCharacteristics(product, suggestedCategory),
    };
  }

  private detectCategory(corpus: string): CatalogCategorySuggestion | null {
    let best: CatalogCategorySuggestion | null = null;

    for (const rule of CATEGORY_DICTIONARY) {
      const matchedKeywords = rule.keywords.filter((keyword) => corpus.includes(keyword));
      if (matchedKeywords.length === 0) {
        continue;
      }

      const confidence = Math.min(1, matchedKeywords.length / 3);
      if (!best || confidence > best.confidence) {
        best = {
          categorySlug: rule.categorySlug,
          categoryName: rule.categoryName,
          confidence: Number(confidence.toFixed(2)),
          matchedKeywords,
        };
      }
    }

    return best;
  }

  private detectSubcategory(
    corpus: string,
    categorySlug: string,
  ): CatalogSubcategorySuggestion | null {
    const category = CATEGORY_DICTIONARY.find((entry) => entry.categorySlug === categorySlug);
    if (!category) {
      return null;
    }

    let best: CatalogSubcategorySuggestion | null = null;

    for (const subcategory of category.subcategories) {
      const matchedKeywords = subcategory.keywords.filter((keyword) => corpus.includes(keyword));
      if (matchedKeywords.length === 0) {
        continue;
      }

      const confidence = Math.min(1, matchedKeywords.length / 2);
      if (!best || confidence > best.confidence) {
        best = {
          subcategorySlug: subcategory.subcategorySlug,
          subcategoryName: subcategory.subcategoryName,
          confidence: Number(confidence.toFixed(2)),
          matchedKeywords,
        };
      }
    }

    if (best) {
      return best;
    }

    const fallback = category.subcategories[0];
    if (!fallback) {
      return null;
    }

    return {
      subcategorySlug: fallback.subcategorySlug,
      subcategoryName: fallback.subcategoryName,
      confidence: 0.3,
      matchedKeywords: [],
    };
  }

  private generateTags(product: CatalogProductInput): string[] {
    const tokens = this.tokenize(`${product.name} ${product.description ?? ""}`);
    const tags = new Set<string>();

    for (const token of tokens) {
      if (token.length >= 3) {
        tags.add(token);
      }
    }

    if (product.unit?.trim()) {
      tags.add(product.unit.trim().toLowerCase());
    }

    return [...tags].slice(0, 8);
  }

  private generateCharacteristics(
    product: CatalogProductInput,
    category: CatalogCategorySuggestion | null,
  ): Record<string, string> {
    const characteristics: Record<string, string> = {};
    const corpus = `${product.name} ${product.description ?? ""}`.toLowerCase();

    if (product.unit?.trim()) {
      characteristics.unit = product.unit.trim();
    }
    if (product.currency?.trim()) {
      characteristics.currency = product.currency.trim();
    }
    if (typeof product.stock === "number") {
      characteristics.stock = String(product.stock);
    }
    if (category) {
      characteristics.category = category.categoryName;
    }
    if (corpus.includes("орган") || corpus.includes("organic")) {
      characteristics.organic = "yes";
    }
    if (corpus.includes("свеж") || corpus.includes("fresh")) {
      characteristics.fresh = "yes";
    }
    if (corpus.includes("замороз") || corpus.includes("frozen")) {
      characteristics.frozen = "yes";
    }

    return characteristics;
  }

  private calculateCatalogScore(checks: CatalogAnalysisResult["checks"]): number {
    let score = 100;

    if (!checks.name.passed) {
      score -= 20;
    }
    if (!checks.description.passed) {
      score -= 15;
    }
    score -= checks.requiredFields.missing.length * 10;
    if (!checks.photos.hasPhoto) {
      score -= 25;
    }
    if (!checks.category.assigned) {
      score -= 10;
    } else if (!checks.category.matchesSuggestion) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private countWords(value: string): number {
    return value.split(/\s+/).filter(Boolean).length;
  }

  private tokenize(value: string): string[] {
    return value
      .toLowerCase()
      .split(/[^a-zа-яё0-9]+/i)
      .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
  }

  private inferAssignedCategorySlug(_categoryId: string | null | undefined): string | null {
    return null;
  }
}
