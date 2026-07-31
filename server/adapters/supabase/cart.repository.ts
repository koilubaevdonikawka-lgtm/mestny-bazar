import { supabaseAdmin } from "@server/adapters/supabase/client";
import type { CartLineUpsertInput, ICartRepository } from "@server/ports/cart.repository";
import type { CartDTO, CartItemDTO, CartLineIdentifier } from "@shared/contracts/cart";

interface CartItemRow {
  product_id: string | null;
  product_slug: string | null;
  quantity: number;
  name: string;
  price: number;
  currency: string;
  image_url: string | null;
}

export function mapCartItemRow(row: CartItemRow): CartItemDTO {
  return {
    productId: row.product_id ?? undefined,
    productSlug: row.product_slug ?? undefined,
    quantity: row.quantity,
    name: row.name,
    price: row.price,
    currency: row.currency,
    imageUrl: row.image_url,
  };
}

export class SupabaseCartRepository implements ICartRepository {
  private async getCartId(userId: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to load cart: ${error.message}`);
    return data?.id ?? null;
  }

  async getByUserId(userId: string): Promise<CartDTO> {
    const cartId = await this.getCartId(userId);
    if (!cartId) return { items: [], updatedAt: null };

    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .select("product_id, product_slug, quantity, name, price, currency, image_url")
      .eq("cart_id", cartId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to load cart items: ${error.message}`);
    return { items: (data ?? []).map(mapCartItemRow), updatedAt: new Date().toISOString() };
  }

  async upsertItems(userId: string, items: CartLineUpsertInput[]): Promise<CartDTO> {
    const { data, error } = await supabaseAdmin.rpc("upsert_cart_items", {
      p_user_id: userId,
      p_items: items.map((item) => ({
        productId: item.productId ?? null,
        productSlug: item.productSlug ?? null,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        currency: item.currency,
        imageUrl: item.imageUrl,
      })),
    });

    if (error) throw new Error(`Failed to upsert cart items: ${error.message}`);
    return { items: (data ?? []).map(mapCartItemRow), updatedAt: new Date().toISOString() };
  }

  async updateQuantity(
    userId: string,
    identifier: CartLineIdentifier,
    quantity: number,
  ): Promise<CartDTO> {
    const cartId = await this.getCartId(userId);
    if (!cartId) return { items: [], updatedAt: null };

    const { error } = identifier.productId
      ? await supabaseAdmin
          .from("cart_items")
          .update({ quantity })
          .eq("cart_id", cartId)
          .eq("product_id", identifier.productId)
      : await supabaseAdmin
          .from("cart_items")
          .update({ quantity })
          .eq("cart_id", cartId)
          .eq("product_slug", identifier.productSlug ?? "");

    if (error) throw new Error(`Failed to update cart item: ${error.message}`);
    return this.getByUserId(userId);
  }

  async removeItem(userId: string, identifier: CartLineIdentifier): Promise<CartDTO> {
    const cartId = await this.getCartId(userId);
    if (!cartId) return { items: [], updatedAt: null };

    const { error } = identifier.productId
      ? await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("cart_id", cartId)
          .eq("product_id", identifier.productId)
      : await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("cart_id", cartId)
          .eq("product_slug", identifier.productSlug ?? "");

    if (error) throw new Error(`Failed to remove cart item: ${error.message}`);
    return this.getByUserId(userId);
  }

  async clear(userId: string): Promise<void> {
    const cartId = await this.getCartId(userId);
    if (!cartId) return;

    const { error } = await supabaseAdmin.from("cart_items").delete().eq("cart_id", cartId);
    if (error) throw new Error(`Failed to clear cart: ${error.message}`);
  }
}
