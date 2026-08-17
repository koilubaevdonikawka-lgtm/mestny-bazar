import type {
  SetVariantAttributeValueRequest,
  VariantAttributeValueDTO,
} from "@shared/contracts/product-variant";
import type { IVariantAttributeRepository } from "@server/ports/variant-attribute.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface VariantAttributeValueRow {
  id: string;
  variant_id: string;
  attribute_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  attribute_value_id: string | null;
}

export function mapVariantAttributeValueRow(
  row: VariantAttributeValueRow,
): VariantAttributeValueDTO {
  return {
    id: row.id,
    variantId: row.variant_id,
    attributeId: row.attribute_id,
    valueText: row.value_text,
    valueNumber: row.value_number,
    valueBoolean: row.value_boolean,
    attributeValueId: row.attribute_value_id,
  };
}

const SELECT =
  "id, variant_id, attribute_id, value_text, value_number, value_boolean, attribute_value_id";

export class SupabaseVariantAttributeRepository implements IVariantAttributeRepository {
  async listForVariant(variantId: string): Promise<VariantAttributeValueDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("product_variant_attribute_values")
      .select(SELECT)
      .eq("variant_id", variantId);

    if (error) throw new Error(`Failed to list variant attribute values: ${error.message}`);
    return (data ?? []).map(mapVariantAttributeValueRow);
  }

  async setValue(data: SetVariantAttributeValueRequest): Promise<VariantAttributeValueDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("product_variant_attribute_values")
      .upsert(
        {
          variant_id: data.variantId,
          attribute_id: data.attributeId,
          value_text: data.valueText ?? null,
          value_number: data.valueNumber ?? null,
          value_boolean: data.valueBoolean ?? null,
          attribute_value_id: data.attributeValueId ?? null,
        },
        { onConflict: "variant_id,attribute_id" },
      )
      .select(SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to set variant attribute value: ${error?.message ?? "unknown"}`);
    return mapVariantAttributeValueRow(row);
  }

  async removeValue(variantId: string, attributeId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("product_variant_attribute_values")
      .delete()
      .eq("variant_id", variantId)
      .eq("attribute_id", attributeId);

    if (error) throw new Error(`Failed to remove variant attribute value: ${error.message}`);
  }
}
