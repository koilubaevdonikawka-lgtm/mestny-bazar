import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const p = product.node;
  const variant = p.variants.edges[0]?.node;
  const image = p.images.edges[0]?.node;
  const price = p.priceRange.minVariantPrice;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Добавлено в корзину", {
      description: p.title,
      position: "top-center",
    });
  };

  return (
    <Link
      to="/product/$handle"
      params={{ handle: p.handle }}
      className="group block rounded-2xl bg-card overflow-hidden border border-border/60 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
    >
      <div className="aspect-square overflow-hidden bg-secondary relative">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || p.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Нет фото
          </div>
        )}
      </div>
      <div className="p-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-base truncate">{p.title}</h3>
          <p className="mt-1 font-serif text-lg text-primary">
            {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          disabled={isLoading || !variant}
          size="icon"
          variant="default"
          className="rounded-full h-10 w-10 flex-shrink-0"
          aria-label="Добавить в корзину"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
    </Link>
  );
}
