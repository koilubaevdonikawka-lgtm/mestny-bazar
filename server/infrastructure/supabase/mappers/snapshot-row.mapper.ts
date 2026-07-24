import type { SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Maps aggregate read models to Supabase snapshot rows. */
export function toSnapshotRow<T extends { id: string; updatedAt: string }>(
  snapshot: T,
): SnapshotRow<T> {
  return {
    id: snapshot.id,
    snapshot,
    updated_at: snapshot.updatedAt,
  };
}

/** Extracts a read model from a Supabase snapshot row. */
export function fromSnapshotRow<T>(row: SnapshotRow<T> | null): T | null {
  return row?.snapshot ?? null;
}

/** Maps category snapshots with catalog index column. */
export function toCategorySnapshotRow<T extends { id: string; catalogId: string; updatedAt: string }>(
  snapshot: T,
): SnapshotRow<T> & { catalog_id: string } {
  return {
    id: snapshot.id,
    catalog_id: snapshot.catalogId,
    snapshot,
    updated_at: snapshot.updatedAt,
  };
}

/** Maps order snapshots with order number index column. */
export function toOrderSnapshotRow<T extends { id: string; orderNumber: string; updatedAt: string }>(
  snapshot: T,
): SnapshotRow<T> & { order_number: string } {
  return {
    id: snapshot.id,
    order_number: snapshot.orderNumber,
    snapshot,
    updated_at: snapshot.updatedAt,
  };
}
