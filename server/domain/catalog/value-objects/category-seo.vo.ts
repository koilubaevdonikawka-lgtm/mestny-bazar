import { InvalidCategorySeoError } from "@server/domain/catalog/exceptions/catalog.errors";
import type { ValueObject } from "@server/domain/catalog/value-objects/value-object.types";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 320;
const MAX_KEYWORD_LENGTH = 50;
const MAX_KEYWORDS = 20;

export interface CategorySeoJSON {
  title: string | null;
  description: string | null;
  keywords: string[];
}

export class CategorySeo implements ValueObject<CategorySeo, CategorySeoJSON> {
  private constructor(
    private readonly title: string | null,
    private readonly description: string | null,
    private readonly keywords: readonly string[],
  ) {}

  static empty(): CategorySeo {
    return new CategorySeo(null, null, []);
  }

  static create(input: Partial<CategorySeoJSON> = {}): CategorySeo {
    const title = input.title?.trim() ?? null;
    const description = input.description?.trim() ?? null;
    const keywords = (input.keywords ?? [])
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .slice(0, MAX_KEYWORDS);

    if (title && title.length > MAX_TITLE_LENGTH) {
      throw new InvalidCategorySeoError("SEO title exceeds maximum length");
    }
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      throw new InvalidCategorySeoError("SEO description exceeds maximum length");
    }
    if (keywords.some((keyword) => keyword.length > MAX_KEYWORD_LENGTH)) {
      throw new InvalidCategorySeoError("SEO keyword exceeds maximum length");
    }

    return new CategorySeo(title, description, keywords);
  }

  static from(json: CategorySeoJSON): CategorySeo {
    return CategorySeo.create(json);
  }

  valueOf(): CategorySeoJSON {
    return this.toJSON();
  }

  equals(other: CategorySeo): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  toJSON(): CategorySeoJSON {
    return Object.freeze({
      title: this.title,
      description: this.description,
      keywords: [...this.keywords],
    });
  }

  clone(): CategorySeo {
    return CategorySeo.from(this.toJSON());
  }
}
