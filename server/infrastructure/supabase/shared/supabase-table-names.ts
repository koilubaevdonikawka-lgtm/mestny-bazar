/** Supabase table names for DDD aggregate snapshot persistence. */
export const SupabaseSnapshotTables = Object.freeze({
  products: "marketplace_product_snapshots",
  sellers: "marketplace_seller_snapshots",
  catalogs: "marketplace_catalog_snapshots",
  categories: "marketplace_category_snapshots",
  orders: "marketplace_order_snapshots",
  payments: "marketplace_payment_snapshots",
  domainEvents: "marketplace_domain_events",
});

/** Generic snapshot row stored as JSONB in Supabase. */
export interface SnapshotRow<TSnapshot> {
  id: string;
  snapshot: TSnapshot;
  updated_at: string;
}

export interface CategorySnapshotRow<TSnapshot> extends SnapshotRow<TSnapshot> {
  catalog_id: string;
}

export interface OrderSnapshotRow<TSnapshot> extends SnapshotRow<TSnapshot> {
  order_number: string;
}

export interface DomainEventRow {
  id: string;
  event_name: string;
  aggregate_id: string;
  aggregate_type: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}
