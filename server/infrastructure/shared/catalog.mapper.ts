import type { CatalogReadModel, ReconstituteCatalogProps } from "@server/domain/catalog";
import { Catalog } from "@server/domain/catalog";

export function catalogReadModelToReconstituteProps(
  model: CatalogReadModel,
): ReconstituteCatalogProps {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    rootCategoryIds: [...model.rootCategoryIds],
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export function reconstituteCatalog(model: CatalogReadModel): Catalog {
  return Catalog.reconstitute(catalogReadModelToReconstituteProps(model));
}
