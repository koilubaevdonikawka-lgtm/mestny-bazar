import type {
  ProductAttributeValueDTO,
  SetProductAttributeValueRequest,
} from "@shared/contracts/product-attributes";
import type { IProductAttributeRepository } from "@server/ports/product-attribute.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface ProductAttributeValueRow {
  id: string;
  product_id: string;
  attribute_id: string;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  attribute_value_id: string | null;
}

export function mapProductAttributeValueRow(
  row: ProductAttributeValueRow,
): ProductAttributeValueDTO {
  return {
    id: row.id,
    productId: row.product_id,
    attributeId: row.attribute_id,
    valueText: row.value_text,
    valueNumber: row.value_number,
    valueBoolean: row.value_boolean,
    attributeValueId: row.attribute_value_id,
  };
}

const SELECT =
  "id, product_id, attribute_id, value_text, value_number, value_boolean, attribute_value_id";

export class SupabaseProductAttributeRepository implements IProductAttributeRepository {
  async listForProduct(productId: string): Promise<ProductAttributeValueDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("product_attribute_values")
      .select(SELECT)
      .eq("product_id", productId);

    if (error) throw new Error(`Failed to list product attribute values: ${error.message}`);
    return (data ?? []).map(mapProductAttributeValueRow);
  }

  async setValue(data: SetProductAttributeValueRequest): Promise<ProductAttributeValueDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("product_attribute_values")
      .upsert(
        {
          product_id: data.productId,
          attribute_id: data.attributeId,
          value_text: data.valueText ?? null,
          value_number: data.valueNumber ?? null,
          value_boolean: data.valueBoolean ?? null,
          attribute_value_id: data.attributeValueId ?? null,
        },
        { onConflict: "product_id,attribute_id" },
      )
      .select(SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to set product attribute value: ${error?.message ?? "unknown"}`);
    return mapProductAttributeValueRow(row);
  }

  async removeValue(productId: string, attributeId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("product_attribute_values")
      .delete()
      .eq("product_id", productId)
      .eq("attribute_id", attributeId);

    if (error) throw new Error(`Failed to remove product attribute value: ${error.message}`);
  }
}
