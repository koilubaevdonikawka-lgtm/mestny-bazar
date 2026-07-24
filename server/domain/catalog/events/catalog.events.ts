import { DomainEvent } from "@server/domain/catalog/events/domain-event.base";
import type { CategoryLifecycleStatus } from "@server/domain/catalog/status/category-status";

export abstract class CatalogDomainEventBase extends DomainEvent {
  protected constructor(
    readonly catalogId: string,
    occurredAt: string,
  ) {
    super(occurredAt);
  }
}

export abstract class CategoryDomainEventBase extends DomainEvent {
  protected constructor(
    readonly categoryId: string,
    readonly catalogId: string,
    occurredAt: string,
  ) {
    super(occurredAt);
  }
}

export class CatalogCreatedEvent extends CatalogDomainEventBase {
  readonly eventName = "catalog.created" as const;

  constructor(
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      name: string;
      description: string | null;
    },
  ) {
    super(catalogId, occurredAt);
  }
}

export class CatalogUpdatedEvent extends CatalogDomainEventBase {
  readonly eventName = "catalog.updated" as const;

  constructor(
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      name: string;
      description: string | null;
      rootCategoryIds: string[];
    },
  ) {
    super(catalogId, occurredAt);
  }
}

export class CategoryCreatedEvent extends CategoryDomainEventBase {
  readonly eventName = "category.created" as const;

  constructor(
    categoryId: string,
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      name: string;
      slug: string;
      path: string;
      parentId: string | null;
      depth: number;
      status: CategoryLifecycleStatus;
    },
  ) {
    super(categoryId, catalogId, occurredAt);
  }
}

export class CategoryUpdatedEvent extends CategoryDomainEventBase {
  readonly eventName = "category.updated" as const;

  constructor(
    categoryId: string,
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      name: string;
      slug: string;
      sortOrder: number;
    },
  ) {
    super(categoryId, catalogId, occurredAt);
  }
}

export class CategoryMovedEvent extends CategoryDomainEventBase {
  readonly eventName = "category.moved" as const;

  constructor(
    categoryId: string,
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      previousParentId: string | null;
      newParentId: string | null;
      previousPath: string;
      newPath: string;
      previousDepth: number;
      newDepth: number;
    },
  ) {
    super(categoryId, catalogId, occurredAt);
  }
}

export class CategoryHiddenEvent extends CategoryDomainEventBase {
  readonly eventName = "category.hidden" as const;

  constructor(
    categoryId: string,
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: CategoryLifecycleStatus;
      cascadeToChildren: boolean;
    },
  ) {
    super(categoryId, catalogId, occurredAt);
  }
}

export class CategoryVisibleEvent extends CategoryDomainEventBase {
  readonly eventName = "category.visible" as const;

  constructor(
    categoryId: string,
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: CategoryLifecycleStatus;
    },
  ) {
    super(categoryId, catalogId, occurredAt);
  }
}

export class CategoryArchivedEvent extends CategoryDomainEventBase {
  readonly eventName = "category.archived" as const;

  constructor(
    categoryId: string,
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: CategoryLifecycleStatus;
    },
  ) {
    super(categoryId, catalogId, occurredAt);
  }
}

export class CategoryRestoredEvent extends CategoryDomainEventBase {
  readonly eventName = "category.restored" as const;

  constructor(
    categoryId: string,
    catalogId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: CategoryLifecycleStatus;
    },
  ) {
    super(categoryId, catalogId, occurredAt);
  }
}

export type CatalogDomainEvent = CatalogCreatedEvent | CatalogUpdatedEvent;

export type CategoryDomainEvent =
  | CategoryCreatedEvent
  | CategoryUpdatedEvent
  | CategoryMovedEvent
  | CategoryHiddenEvent
  | CategoryVisibleEvent
  | CategoryArchivedEvent
  | CategoryRestoredEvent;

export type CatalogModuleDomainEvent = CatalogDomainEvent | CategoryDomainEvent;

export type CatalogModuleDomainEventType = CatalogModuleDomainEvent["eventName"];
