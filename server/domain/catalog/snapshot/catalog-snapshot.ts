import { CatalogId, CatalogName, CatalogDescription } from "@server/domain/catalog/value-objects";

export interface CatalogReadModel {
  id: string;
  name: string;
  description: string | null;
  rootCategoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export class CatalogSnapshot implements CatalogReadModel {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly rootCategoryIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(data: CatalogReadModel) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.rootCategoryIds = Object.freeze([...data.rootCategoryIds]);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    Object.freeze(this);
  }

  static capture(input: {
    id: CatalogId;
    name: CatalogName;
    description: CatalogDescription;
    rootCategoryIds: readonly string[];
    createdAt: string;
    updatedAt: string;
  }): CatalogSnapshot {
    return new CatalogSnapshot({
      id: input.id.toString(),
      name: input.name.toString(),
      description: input.description.toString(),
      rootCategoryIds: [...input.rootCategoryIds],
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  static fromJSON(data: CatalogReadModel): CatalogSnapshot {
    return new CatalogSnapshot(data);
  }

  toJSON(): CatalogReadModel {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      rootCategoryIds: [...this.rootCategoryIds],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  equals(other: CatalogSnapshot): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }

  clone(): CatalogSnapshot {
    return CatalogSnapshot.fromJSON(this.toJSON());
  }
}
