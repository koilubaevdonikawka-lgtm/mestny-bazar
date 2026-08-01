-- Suppliers (suppliers.md) — a wholly new domain (0 matches in the codebase before this
-- migration). Purchase price is stored separately from products.price (retail) — the two
-- are never reconciled automatically here; that is finance.md's job as a read-only consumer.
CREATE TYPE public.supply_status AS ENUM ('DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'CANCELLED');

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_phone TEXT,
  contact_person TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  status public.supply_status NOT NULL DEFAULT 'DRAFT',
  expected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.supply_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id UUID NOT NULL REFERENCES public.supplies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  purchase_price NUMERIC(10,2) NOT NULL CHECK (purchase_price >= 0)
);

CREATE INDEX idx_supplies_supplier ON public.supplies(supplier_id);
CREATE INDEX idx_supply_items_supply ON public.supply_items(supply_id);

GRANT SELECT, INSERT, UPDATE ON public.suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.supplies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.supply_items TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
GRANT ALL ON public.supplies TO service_role;
GRANT ALL ON public.supply_items TO service_role;

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_supplies_updated BEFORE UPDATE ON public.supplies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Supplier list itself: Admin manages it, Warehouse only needs to read it to pick a
-- supplier when creating a supply request (warehouse.md/suppliers.md access matrix).
CREATE POLICY "suppliers_admin_all" ON public.suppliers
  FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "suppliers_warehouse_read" ON public.suppliers
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'warehouse'));

-- Supplies/supply items: both Admin and Warehouse can create requests and confirm receipt.
CREATE POLICY "supplies_staff_all" ON public.supplies
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'warehouse'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'warehouse'));
CREATE POLICY "supply_items_staff_all" ON public.supply_items
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'warehouse'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'warehouse'));
