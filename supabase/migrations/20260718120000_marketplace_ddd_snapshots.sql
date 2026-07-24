-- DDD aggregate snapshot tables for marketplace infrastructure adapter (Stage 31)

CREATE TABLE IF NOT EXISTS marketplace_product_snapshots (
  id text PRIMARY KEY,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_seller_snapshots (
  id text PRIMARY KEY,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_catalog_snapshots (
  id text PRIMARY KEY,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_category_snapshots (
  id text PRIMARY KEY,
  catalog_id text NOT NULL,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_category_catalog_id
  ON marketplace_category_snapshots (catalog_id);

CREATE TABLE IF NOT EXISTS marketplace_order_snapshots (
  id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_order_number
  ON marketplace_order_snapshots (order_number);

CREATE TABLE IF NOT EXISTS marketplace_domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  aggregate_id text NOT NULL,
  aggregate_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_domain_events_name
  ON marketplace_domain_events (event_name);

CREATE INDEX IF NOT EXISTS idx_marketplace_domain_events_aggregate
  ON marketplace_domain_events (aggregate_type, aggregate_id);

ALTER TABLE marketplace_product_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_seller_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_catalog_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_category_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_order_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_domain_events ENABLE ROW LEVEL SECURITY;
