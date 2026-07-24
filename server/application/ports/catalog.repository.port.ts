import type { Catalog } from "@server/domain/catalog";
import type { CatalogReadModel } from "@server/domain/catalog";

/** Catalog persistence port — implementation lives in adapters. */
export interface ICatalogRepository {
  save(catalog: Catalog): Promise<void>;
  findById(id: string): Promise<Catalog | null>;
  findSnapshotById(id: string): Promise<CatalogReadModel | null>;
  exists(id: string): Promise<boolean>;
}
