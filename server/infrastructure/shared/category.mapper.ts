import type { CategoryReadModel, ReconstituteCategoryProps } from "@server/domain/catalog";
import { Category } from "@server/domain/catalog";

export function categoryReadModelToReconstituteProps(
  model: CategoryReadModel,
): ReconstituteCategoryProps {
  return {
    id: model.id,
    catalogId: model.catalogId,
    name: model.name,
    slug: model.slug,
    path: {
      value: model.path,
      segments: [...model.pathSegments],
      depth: model.depth,
    },
    parentId: model.parentId,
    childrenIds: [...model.childrenIds],
    sortOrder: model.sortOrder,
    status: model.status,
    visibility: {
      showInNavigation: model.visibility.showInNavigation,
      showInSearch: model.visibility.showInSearch,
    },
    seo: {
      title: model.seo.title,
      description: model.seo.description,
      keywords: [...model.seo.keywords],
    },
    metadata: {
      entries: { ...model.metadata },
    },
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export function reconstituteCategory(model: CategoryReadModel): Category {
  return Category.reconstitute(categoryReadModelToReconstituteProps(model));
}
