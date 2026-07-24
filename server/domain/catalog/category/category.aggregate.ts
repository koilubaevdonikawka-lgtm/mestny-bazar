import {
  CatalogPolicyViolationError,
  CatalogInvariantViolationError,
} from "@server/domain/catalog/exceptions/catalog.errors";
import {
  CategoryArchivedEvent,
  CategoryCreatedEvent,
  CategoryHiddenEvent,
  CategoryMovedEvent,
  CategoryRestoredEvent,
  CategoryUpdatedEvent,
  CategoryVisibleEvent,
  type CategoryDomainEvent,
} from "@server/domain/catalog/events/catalog.events";
import { CategoryLifecycle } from "@server/domain/catalog/lifecycle/category-lifecycle";
import {
  CatalogPolicy,
  type CategoryHierarchyContext,
  type CategoryPolicySnapshot,
  type CategoryVisibilityContext,
} from "@server/domain/catalog/policies/catalog.policy";
import { CategorySnapshot, type CategoryReadModel } from "@server/domain/catalog/snapshot/category-snapshot";
import { CategoryLifecycleStatus } from "@server/domain/catalog/status/category-status";
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

export interface CreateCategoryProps {
  id: string;
  catalogId: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  parentPath?: ReturnType<CategoryPath["toJSON"]> | null;
  parentSnapshot?: CategoryPolicySnapshot | null;
  sortOrder?: number;
  seo?: Partial<ReturnType<CategorySeo["toJSON"]>>;
  metadata?: Record<string, string>;
  hierarchyContext: Omit<CategoryHierarchyContext, "currentParentId" | "currentPath">;
}

export interface ReconstituteCategoryProps {
  id: string;
  catalogId: string;
  name: string;
  slug: string;
  path: ReturnType<CategoryPath["toJSON"]>;
  parentId: string | null;
  childrenIds: string[];
  sortOrder: number;
  status: CategoryLifecycleStatus;
  visibility: ReturnType<CategoryVisibility["toJSON"]>;
  seo: ReturnType<CategorySeo["toJSON"]>;
  metadata: ReturnType<CategoryMetadata["toJSON"]>;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryVisibilityInput {
  parent: CategoryPolicySnapshot | null;
}

export type { CategoryReadModel };

/** Category aggregate root — independent from Catalog aggregate. */
export class Category {
  private readonly domainEvents: CategoryDomainEvent[] = [];
  private readonly policy = new CatalogPolicy();

  private constructor(
    private readonly id: CategoryId,
    private readonly catalogId: CatalogId,
    private name: CategoryName,
    private slug: CategorySlug,
    private path: CategoryPath,
    private parentId: string | null,
    private childrenIds: string[],
    private sortOrder: CategorySortOrder,
    private status: CategoryStatus,
    private visibility: CategoryVisibility,
    private seo: CategorySeo,
    private metadata: CategoryMetadata,
    private readonly createdAt: string,
    private updatedAt: string,
  ) {}

  static create(props: CreateCategoryProps): Category {
    const policy = new CatalogPolicy();
    const name = CategoryName.create(props.name);
    const slug = props.slug ? CategorySlug.create(props.slug) : CategorySlug.fromName(name.toString());
    const parentPath = props.parentPath ? CategoryPath.from(props.parentPath) : null;
    const path = parentPath ? CategoryPath.fromParent(parentPath, slug) : CategoryPath.root(slug);
    const parentId = props.parentId?.trim() ?? null;

    policy.validateHierarchyCreate({
      ...props.hierarchyContext,
      categoryId: props.id,
      catalogId: props.catalogId,
      newParentId: parentId,
      newPath: path.pathValue(),
      newDepth: path.depthValue(),
    });

    const initialVisibility = policy.resolveInheritedVisibilityFromParent(
      props.parentSnapshot ?? null,
    );

    const now = new Date().toISOString();
    const category = new Category(
      CategoryId.create(props.id),
      CatalogId.create(props.catalogId),
      name,
      slug,
      path,
      parentId,
      [],
      props.sortOrder !== undefined
        ? CategorySortOrder.create(props.sortOrder)
        : CategorySortOrder.initial(),
      CategoryStatus.draft(),
      initialVisibility,
      props.seo ? CategorySeo.create(props.seo) : CategorySeo.empty(),
      props.metadata ? CategoryMetadata.create(props.metadata) : CategoryMetadata.empty(),
      now,
      now,
    );

    category.record(
      new CategoryCreatedEvent(category.id.toString(), category.catalogId.toString(), now, {
        name: category.name.toString(),
        slug: category.slug.toString(),
        path: category.path.pathValue(),
        parentId: category.parentId,
        depth: category.path.depthValue(),
        status: category.status.toString(),
      }),
    );

    return category;
  }

  static reconstitute(props: ReconstituteCategoryProps): Category {
    return new Category(
      CategoryId.create(props.id),
      CatalogId.create(props.catalogId),
      CategoryName.create(props.name),
      CategorySlug.create(props.slug),
      CategoryPath.from(props.path),
      props.parentId,
      [...props.childrenIds],
      CategorySortOrder.create(props.sortOrder),
      CategoryStatus.create(props.status),
      CategoryVisibility.from(props.visibility),
      CategorySeo.from(props.seo),
      CategoryMetadata.from(props.metadata),
      props.createdAt,
      props.updatedAt,
    );
  }

  rename(name: string): void {
    this.assertPolicy(this.policy.canRename.bind(this.policy), "rename");
    this.name = CategoryName.create(name);
    this.touch();
    this.recordUpdated();
  }

  move(input: {
    newParentId: string | null;
    parentPath: ReturnType<CategoryPath["toJSON"]> | null;
    hierarchyContext: CategoryHierarchyContext;
    parentSnapshot?: CategoryPolicySnapshot | null;
  }): void {
    this.assertPolicy(this.policy.canMove.bind(this.policy), "move");

    const newParentId = input.newParentId?.trim() ?? null;
    const parentPath = input.parentPath ? CategoryPath.from(input.parentPath) : null;
    const newPath = parentPath
      ? CategoryPath.fromParent(parentPath, this.slug)
      : CategoryPath.root(this.slug);

    this.policy.validateHierarchyMove({
      ...input.hierarchyContext,
      categoryId: this.id.toString(),
      catalogId: this.catalogId.toString(),
      currentParentId: this.parentId,
      newParentId,
      currentPath: this.path.pathValue(),
      newPath: newPath.pathValue(),
      newDepth: newPath.depthValue(),
    });

    if (
      input.parentSnapshot &&
      this.policy.shouldInheritParentHiding(input.parentSnapshot) &&
      this.status.toString() === CategoryLifecycleStatus.Visible
    ) {
      throw new CatalogPolicyViolationError(
        "Cannot move visible category under a hidden parent",
        "move",
      );
    }

    const previousParentId = this.parentId;
    const previousPath = this.path.pathValue();
    const previousDepth = this.path.depthValue();

    this.parentId = newParentId;
    this.path = newPath;

    if (input.parentSnapshot) {
      this.visibility = this.policy.resolveInheritedVisibilityFromParent(input.parentSnapshot);
    }

    this.touch();

    this.record(
      new CategoryMovedEvent(this.id.toString(), this.catalogId.toString(), this.updatedAt, {
        previousParentId,
        newParentId,
        previousPath,
        newPath: newPath.pathValue(),
        previousDepth,
        newDepth: newPath.depthValue(),
      }),
    );
  }

  show(input: CategoryVisibilityInput): void {
    const context = this.visibilityContext(input.parent);
    if (!this.policy.canShowCategory(context)) {
      throw new CatalogPolicyViolationError(
        "Category cannot be shown while parent is hidden",
        "show",
      );
    }

    this.assertPolicy(this.policy.canPublish.bind(this.policy), "show");

    const previousStatus = this.status.toString();
    this.transitionStatus("show");
    this.visibility = this.policy.resolveVisibilityForShow(this.visibility, input.parent);

    this.record(
      new CategoryVisibleEvent(this.id.toString(), this.catalogId.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  hide(): void {
    this.assertPolicy(this.policy.canHide.bind(this.policy), "hide");

    const previousStatus = this.status.toString();
    this.transitionStatus("hide");
    this.visibility = this.policy.resolveVisibilityForHide();

    this.record(
      new CategoryHiddenEvent(this.id.toString(), this.catalogId.toString(), this.updatedAt, {
        previousStatus,
        cascadeToChildren: this.policy.shouldCascadeHideToChildren(this.visibilityContext(null)),
      }),
    );
  }

  archive(): void {
    this.assertPolicy(this.policy.canArchive.bind(this.policy), "archive");

    const previousStatus = this.status.toString();
    this.transitionStatus("archive");
    this.visibility = CategoryVisibility.hidden();

    this.record(
      new CategoryArchivedEvent(this.id.toString(), this.catalogId.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  restore(input: CategoryVisibilityInput): void {
    this.assertPolicy(this.policy.canRestore.bind(this.policy), "restore");

    const previousStatus = this.status.toString();
    this.transitionStatus("restore");
    this.visibility = this.policy.resolveVisibilityForRestore(input.parent);

    this.record(
      new CategoryRestoredEvent(this.id.toString(), this.catalogId.toString(), this.updatedAt, {
        previousStatus,
      }),
    );
  }

  changeSortOrder(sortOrder: number): void {
    this.assertPolicy(this.policy.canChangeSortOrder.bind(this.policy), "change_sort_order");
    this.sortOrder = CategorySortOrder.create(sortOrder);
    this.touch();
    this.recordUpdated();
  }

  updateSeo(input: Partial<ReturnType<CategorySeo["toJSON"]>>): void {
    this.assertPolicy(this.policy.canRename.bind(this.policy), "update_seo");
    this.seo = CategorySeo.create({ ...this.seo.toJSON(), ...input });
    this.touch();
    this.recordUpdated();
  }

  updateMetadata(entries: Record<string, string>): void {
    this.assertPolicy(this.policy.canRename.bind(this.policy), "update_metadata");
    this.metadata = CategoryMetadata.create(entries);
    this.touch();
    this.recordUpdated();
  }

  updateVisibilityFlags(input: Partial<ReturnType<CategoryVisibility["toJSON"]>>): void {
    this.assertPolicy(this.policy.canUpdateVisibilityFlags.bind(this.policy), "update_visibility");

    const next = CategoryVisibility.create({ ...this.visibility.toJSON(), ...input });
    if (
      next.showInNavigationValue() &&
      !this.policy.canExposeInNavigation(this.policySnapshot())
    ) {
      throw new CatalogPolicyViolationError(
        "Category must be visible before exposing in navigation",
        "update_visibility",
      );
    }
    if (next.showInSearchValue() && !this.policy.canExposeInSearch(this.policySnapshot())) {
      throw new CatalogPolicyViolationError(
        "Category must be visible before exposing in search",
        "update_visibility",
      );
    }

    this.visibility = next;
    this.touch();
  }

  applyInheritedHidingFromParent(parent: CategoryPolicySnapshot): void {
    if (!this.policy.shouldInheritParentHiding(parent)) {
      return;
    }

    if (this.status.toString() === CategoryLifecycleStatus.Visible) {
      this.transitionStatus("hide");
      this.record(
        new CategoryHiddenEvent(this.id.toString(), this.catalogId.toString(), this.updatedAt, {
          previousStatus: CategoryLifecycleStatus.Visible,
          cascadeToChildren: false,
        }),
      );
    }

    this.visibility = this.policy.resolveInheritedVisibilityFromParent(parent);
    this.touch();
  }

  linkChild(childId: string): void {
    const normalizedId = childId?.trim();
    if (!normalizedId) {
      throw new CatalogInvariantViolationError("Child category id must be a non-empty string");
    }
    if (normalizedId === this.id.toString()) {
      throw new CatalogInvariantViolationError("Category cannot link itself as a child");
    }
    if (this.childrenIds.includes(normalizedId)) {
      return;
    }
    this.childrenIds = [...this.childrenIds, normalizedId];
    this.touch();
  }

  unlinkChild(childId: string): void {
    const normalizedId = childId?.trim();
    if (!normalizedId) {
      throw new CatalogInvariantViolationError("Child category id must be a non-empty string");
    }
    this.childrenIds = this.childrenIds.filter((id) => id !== normalizedId);
    this.touch();
  }

  pullDomainEvents(): CategoryDomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  peekDomainEvents(): readonly CategoryDomainEvent[] {
    return [...this.domainEvents];
  }

  snapshot(): CategorySnapshot {
    return CategorySnapshot.capture({
      id: this.id,
      catalogId: this.catalogId,
      name: this.name,
      slug: this.slug,
      path: this.path,
      parentId: this.parentId,
      childrenIds: this.childrenIds,
      sortOrder: this.sortOrder,
      status: this.status,
      visibility: this.visibility,
      seo: this.seo,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  private recordUpdated(): void {
    this.record(
      new CategoryUpdatedEvent(this.id.toString(), this.catalogId.toString(), this.updatedAt, {
        name: this.name.toString(),
        slug: this.slug.toString(),
        sortOrder: this.sortOrder.orderValue(),
      }),
    );
  }

  private visibilityContext(parent: CategoryPolicySnapshot | null): CategoryVisibilityContext {
    return {
      category: this.policySnapshot(),
      parent,
      hasChildren: this.childrenIds.length > 0,
    };
  }

  private transitionStatus(action: Parameters<typeof CategoryLifecycle.transition>[1]): void {
    const next = CategoryLifecycle.transition(this.status.toString(), action);
    this.status = CategoryStatus.create(next);
    this.touch();
  }

  private policySnapshot(): CategoryPolicySnapshot {
    return {
      status: this.status.toString(),
      visibility: this.visibility,
    };
  }

  private assertPolicy(
    predicate: (snapshot: CategoryPolicySnapshot) => boolean,
    action: string,
  ): void {
    if (!predicate(this.policySnapshot())) {
      throw new CatalogPolicyViolationError(
        `Action "${action}" is not permitted for category in status "${this.status.toString()}"`,
        action,
      );
    }
  }

  private touch(): void {
    this.updatedAt = new Date().toISOString();
  }

  private record(event: CategoryDomainEvent): void {
    this.domainEvents.push(Object.freeze(event));
  }
}
