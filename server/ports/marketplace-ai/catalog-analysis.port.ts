export interface CatalogProductInput {
  name: string;
  slug?: string | null;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  unit?: string | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  stock?: number | null;
}

export interface CatalogNameAnalysis {
  value: string;
  wordCount: number;
  issues: string[];
}

export interface CatalogDescriptionAnalysis {
  value: string | null;
  wordCount: number;
  issues: string[];
}

export interface CatalogRequiredFieldsCheck {
  passed: boolean;
  missing: string[];
  completenessPercent: number;
}

export interface CatalogCategorySuggestion {
  categorySlug: string;
  categoryName: string;
  confidence: number;
  matchedKeywords: string[];
}

export interface CatalogSubcategorySuggestion {
  subcategorySlug: string;
  subcategoryName: string;
  confidence: number;
  matchedKeywords: string[];
}

export interface CatalogAnalysisRecommendations {
  suggestedCategory: CatalogCategorySuggestion | null;
  suggestedSubcategory: CatalogSubcategorySuggestion | null;
  suggestedTags: string[];
  suggestedCharacteristics: Record<string, string>;
}

export interface CatalogAnalysisChecks {
  name: { passed: boolean; issues: string[] };
  description: { passed: boolean; issues: string[] };
  requiredFields: CatalogRequiredFieldsCheck;
  photos: { passed: boolean; hasPhoto: boolean };
  category: {
    passed: boolean;
    assigned: boolean;
    matchesSuggestion: boolean;
  };
}

export interface CatalogAnalysisResult {
  productId: string | null;
  catalogScore: number;
  nameAnalysis: CatalogNameAnalysis;
  descriptionAnalysis: CatalogDescriptionAnalysis;
  checks: CatalogAnalysisChecks;
  recommendations: CatalogAnalysisRecommendations;
}

export interface ICatalogQualityAnalyzer {
  analyze(input: { productId: string | null; product: CatalogProductInput }): CatalogAnalysisResult;
}

export const CATALOG_REQUIRED_FIELDS = ["name", "price", "currency", "imageUrl"] as const;

export type CatalogRequiredField = (typeof CATALOG_REQUIRED_FIELDS)[number];
