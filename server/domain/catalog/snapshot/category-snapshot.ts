import type { CategoryLifecycleStatus } from "@server/domain/catalog/status/category-status";
import {
  CatalogId,
  CategoryId,
  CategoryMetadata,
  CategoryName,
  CategoryPath,
  CategorySeo,
  CategorySlug,
  CategorySortOrder,
  CategoryStatus,
  CategoryVisibility,
} from "@server/domain/catalog/value-objects";

export interface CategoryReadModel {
  id: string;
  catalogId: string;
  name: string;
  slug: string;
  path: string;
  pathSegments: string[];
  depth: number;
  parentId: string | null;
  childrenIds: string[];
  sortOrder: number;
  status: CategoryLifecycleStatus;
  visibility: {
    showInNavigation: boolean;
    showInSearch: boolean;
  };
  seo: {
    title: string | null;
    description: string | null;
    keywords: string[];
  };
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export class CategorySnapshot implements CategoryReadModel {
  readonly id: string;
  readonly catalogId: string;
  readonly name: string;
  readonly slug: string;
  readonly path: string;
  readonly pathSegments: readonly string[];
  readonly depth: number;
  readonly parentId: string | null;
  readonly childrenIds: readonly string[];
  readonly sortOrder: number;
  readonly status: CategoryLifecycleStatus;
  readonly visibility: CategoryReadModel["visibility"];
  readonly seo: CategoryReadModel["seo"];
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(data: CategoryReadModel) {
    this.id = data.id;
    this.catalogId = data.catalogId;
    this.name = data.name;
    this.slug = data.slug;
    this.path = data.path;
    this.pathSegments = Object.freeze([...data.pathSegments]);
    this.depth = data.depth;
    this.parentId = data.parentId;
    this.childrenIds = Object.freeze([...data.childrenIds]);
    this.sortOrder = data.sortOrder;
    this.status = data.status;
    this.visibility = Object.freeze({ ...data.visibility });
    this.seo = Object.freeze({
      title: data.seo.title,
      description: data.seo.description,
      keywords: Object.freeze([...data.seo.keywords]),
    });
    this.metadata = Object.freeze({ ...data.metadata });
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    Object.freeze(this);
  }

  static capture(input: {
    id: CategoryId;
    catalogId: CatalogId;
    name: CategoryName;
    slug: CategorySlug;
    path: CategoryPath;
    parentId: string | null;
    childrenIds: readonly string[];
    sortOrder: CategorySortOrder;
    status: CategoryStatus;
    visibility: CategoryVisibility;
    seo: CategorySeo;
    metadata: CategoryMetadata;
    createdAt: string;
    updatedAt: string;
  }): CategorySnapshot {
    const path = input.path.toJSON();
    const visibility = input.visibility.toJSON();
    const seo = input.seo.toJSON();
    const metadata = input.metadata.toJSON();

    return new CategorySnapshot({
      id: input.id.toString(),
      catalogId: input.catalogId.toString(),
      name: input.name.toString(),
      slug: input.slug.toString(),
      path: path.value,
      pathSegments: [...path.segments],
      depth: path.depth,
      parentId: input.parentId,
      childrenIds: [...input.childrenIds],
      sortOrder: input.sortOrder.orderValue(),
      status: input.status.toString(),
      visibility: {
        showInNavigation: visibility.showInNavigation,
        showInSearch: visibility.showInSearch,
      },
      seo: {
        title: seo.title,
        description: seo.description,
        keywords: [...seo.keywords],
      },
      metadata: { ...metadata.entries },
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  static fromJSON(data: CategoryReadModel): CategorySnapshot {
    return new CategorySnapshot(data);
  }

  toJSON(): CategoryReadModel {
    return {
      id: this.id,
      catalogId: this.catalogId,
      name: this.name,
      slug: this.slug,
      path: this.path,
      pathSegments: [...this.pathSegments],
      depth: this.depth,
      parentId: this.parentId,
      childrenIds: [...this.childrenIds],
      sortOrder: this.sortOrder,
      status: this.status,
      visibility: { ...this.visibility },
      seo: {
        title: this.seo.title,
        description: this.seo.description,
        keywords: [...this.seo.keywords],
      },
      metadata: { ...this.metadata },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  equals(other: CategorySnapshot): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  clone(): CategorySnapshot {
    return CategorySnapshot.fromJSON(this.toJSON());
  }
}
