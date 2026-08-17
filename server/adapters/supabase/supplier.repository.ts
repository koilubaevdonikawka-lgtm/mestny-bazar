import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type {
  CreateSupplierRequest,
  SupplierDTO,
  UpdateSupplierRequest,
} from "@shared/contracts/supplier";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface SupplierRow {
  id: string;
  name: string;
  contact_phone: string | null;
  contact_person: string | null;
  notes: string | null;
  is_active: boolean;
}

export function mapSupplierRow(row: SupplierRow): SupplierDTO {
  return {
    id: row.id,
    name: row.name,
    contactPhone: row.contact_phone,
    contactPerson: row.contact_person,
    notes: row.notes,
    isActive: row.is_active,
  };
}

const SUPPLIER_SELECT = "id, name, contact_phone, contact_person, notes, is_active";

export class SupabaseSupplierRepository implements ISupplierRepository {
  async list(): Promise<SupplierDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .select(SUPPLIER_SELECT)
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to list suppliers: ${error.message}`);
    return (data ?? []).map(mapSupplierRow);
  }

  async getById(id: string): Promise<SupplierDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("suppliers")
      .select(SUPPLIER_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch supplier: ${error.message}`);
    return data ? mapSupplierRow(data) : null;
  }

  async create(data: CreateSupplierRequest): Promise<SupplierDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("suppliers")
      .insert({
        name: data.name,
        contact_phone: data.contactPhone ?? null,
        contact_person: data.contactPerson ?? null,
        notes: data.notes ?? null,
      })
      .select(SUPPLIER_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to create supplier: ${error?.message ?? "unknown"}`);
    return mapSupplierRow(row);
  }

  async update(data: UpdateSupplierRequest): Promise<SupplierDTO> {
    const patch: {
      name?: string;
      contact_phone?: string | null;
      contact_person?: string | null;
      notes?: string | null;
      is_active?: boolean;
    } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.contactPhone !== undefined) patch.contact_phone = data.contactPhone;
    if (data.contactPerson !== undefined) patch.contact_person = data.contactPerson;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.isActive !== undefined) patch.is_active = data.isActive;

    const { data: row, error } = await supabaseAdmin
      .from("suppliers")
      .update(patch)
      .eq("id", data.id)
      .select(SUPPLIER_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to update supplier: ${error?.message ?? "unknown"}`);
    return mapSupplierRow(row);
  }
}
