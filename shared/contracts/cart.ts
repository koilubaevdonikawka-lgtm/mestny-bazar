/** Client-side cart item — no Shopify line IDs or checkout URLs. */
export interface CartItemDTO {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
  unit: string | null;
}

export interface CartSummaryDTO {
  items: CartItemDTO[];
  itemCount: number;
  subtotal: number;
  currency: string;
}
