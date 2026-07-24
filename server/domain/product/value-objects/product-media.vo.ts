import { InvalidProductMediaError } from "@server/domain/product/exceptions/product.errors";
import type { ValueObject } from "@server/domain/product/value-objects/value-object.types";

export interface ProductMediaItem {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProductMediaJSON {
  items: ProductMediaItem[];
}

const MIN_PHOTOS_FOR_PUBLICATION = 1;
const MAX_PHOTOS = 20;

/** Ordered product photo collection. */
export class ProductMedia implements ValueObject<ProductMedia, ProductMediaJSON> {
  private constructor(private readonly items: readonly ProductMediaItem[]) {}

  static create(items: ProductMediaItem[]): ProductMedia {
    if (items.length > MAX_PHOTOS) {
      throw new InvalidProductMediaError(`Product cannot have more than ${MAX_PHOTOS} photos`);
    }

    const seenIds = new Set<string>();
    const seenUrls = new Set<string>();
    const normalized: ProductMediaItem[] = [];

    for (const item of items) {
      const id = item.id?.trim();
      const url = item.url?.trim();
      if (!id || !url) {
        throw new InvalidProductMediaError("Each media item requires id and url");
      }
      if (seenIds.has(id) || seenUrls.has(url)) {
        throw new InvalidProductMediaError("Duplicate media id or url is not allowed");
      }
      if (!Number.isInteger(item.sortOrder) || item.sortOrder < 0) {
        throw new InvalidProductMediaError("Media sortOrder must be a non-negative integer");
      }

      seenIds.add(id);
      seenUrls.add(url);
      normalized.push({ id, url, sortOrder: item.sortOrder });
    }

    normalized.sort((left, right) => left.sortOrder - right.sortOrder);
    return new ProductMedia(Object.freeze(normalized));
  }

  static from(json: ProductMediaJSON): ProductMedia {
    return ProductMedia.create(json.items);
  }

  static empty(): ProductMedia {
    return new ProductMedia(Object.freeze([]));
  }

  valueOf(): ProductMediaJSON {
    return this.toJSON();
  }

  hasMinimumPhotos(): boolean {
    return this.items.length >= MIN_PHOTOS_FOR_PUBLICATION;
  }

  count(): number {
    return this.items.length;
  }

  toArray(): readonly ProductMediaItem[] {
    return this.items;
  }

  equals(other: ProductMedia): boolean {
    if (this.items.length !== other.items.length) {
      return false;
    }
    return this.items.every(
      (item, index) =>
        item.id === other.items[index]?.id &&
        item.url === other.items[index]?.url &&
        item.sortOrder === other.items[index]?.sortOrder,
    );
  }

  toJSON(): ProductMediaJSON {
    return Object.freeze({
      items: Object.freeze(this.items.map((item) => Object.freeze({ ...item }))),
    });
  }

  clone(): ProductMedia {
    return ProductMedia.from(this.toJSON());
  }
}
