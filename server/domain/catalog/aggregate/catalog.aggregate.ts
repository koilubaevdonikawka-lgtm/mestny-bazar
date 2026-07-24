import { CatalogInvariantViolationError } from "@server/domain/catalog/exceptions/catalog.errors";
import {
  CatalogCreatedEvent,
  CatalogUpdatedEvent,
  type CatalogDomainEvent,
} from "@server/domain/catalog/events/catalog.events";
import { CatalogSnapshot, type CatalogReadModel } from "@server/domain/catalog/snapshot/catalog-snapshot";
import { CatalogId, CatalogName, CatalogDescription } from "@server/domain/catalog/value-objects";

export interface CreateCatalogProps {
  id: string;
  name: string;
  description?: string | null;
}

export interface ReconstituteCatalogProps {
  id: string;
  name: string;
  description: string | null;
  rootCategoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type { CatalogReadModel };

/** Catalog aggregate root — marketplace catalog container. */
export class Catalog {
  private readonly domainEvents: CatalogDomainEvent[] = [];

  private constructor(
    private readonly id: CatalogId,
    private name: CatalogName,
    private description: CatalogDescription,
    private rootCategoryIds: string[],
    private readonly createdAt: string,
    private updatedAt: string,
  ) {}

  static create(props: CreateCatalogProps): Catalog {
    const now = new Date().toISOString();
    const catalog = new Catalog(
      CatalogId.create(props.id),
      CatalogName.create(props.name),
      CatalogDescription.create(props.description),
      [],
      now,
      now,
    );

    catalog.record(
      new CatalogCreatedEvent(catalog.id.toString(), now, {
        name: catalog.name.toString(),
        description: catalog.description.toString(),
      }),
    );

    return catalog;
  }

  static reconstitute(props: ReconstituteCatalogProps): Catalog {
    return new Catalog(
      CatalogId.create(props.id),
      CatalogName.create(props.name),
      CatalogDescription.create(props.description),
      [...props.rootCategoryIds],
      props.createdAt,
      props.updatedAt,
    );
  }

  updateName(name: string): void {
    this.name = CatalogName.create(name);
    this.touch();
    this.recordUpdated();
  }

  updateDescription(description: string | null): void {
    this.description = CatalogDescription.create(description);
    this.touch();
    this.recordUpdated();
  }

  registerRootCategory(categoryId: string): void {
    const normalizedId = categoryId?.trim();
    if (!normalizedId) {
      throw new CatalogInvariantViolationError("Root category id must be a non-empty string");
    }

    if (this.rootCategoryIds.includes(normalizedId)) {
      return;
    }

    this.rootCategoryIds = [...this.rootCategoryIds, normalizedId];
    this.touch();
    this.recordUpdated();
  }

  unregisterRootCategory(categoryId: string): void {
    const normalizedId = categoryId?.trim();
    if (!normalizedId) {
      throw new CatalogInvariantViolationError("Root category id must be a non-empty string");
    }

    this.rootCategoryIds = this.rootCategoryIds.filter((id) => id !== normalizedId);
    this.touch();
    this.recordUpdated();
  }

  pullDomainEvents(): CatalogDomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  peekDomainEvents(): readonly CatalogDomainEvent[] {
    return [...this.domainEvents];
  }

  snapshot(): CatalogSnapshot {
    return CatalogSnapshot.capture({
      id: this.id,
      name: this.name,
      description: this.description,
      rootCategoryIds: this.rootCategoryIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  private recordUpdated(): void {
    this.record(
      new CatalogUpdatedEvent(this.id.toString(), this.updatedAt, {
        name: this.name.toString(),
        description: this.description.toString(),
        rootCategoryIds: [...this.rootCategoryIds],
      }),
    );
  }

  private touch(): void {
    this.updatedAt = new Date().toISOString();
  }

  private record(event: CatalogDomainEvent): void {
    this.domainEvents.push(Object.freeze(event));
  }
}
