import { Loader2, Minus, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";

/**
 * Shared "Add to cart" ↔ "[-] qty [+]" control (Этап №4 мобильной корзины) —
 * one place reading/writing useCartStore so the product grid (ProductCard)
 * and the product detail page never drift out of sync on what's already in
 * the cart. Reuses useCartStore.addItem/updateQuantity exactly as CartDrawer
 * already does — no new cart mechanism.
 */
export function CartQuantityControl({
  product,
  size = "sm",
  className = "",
  showLabel = false,
}: {
  product: CatalogProductNode;
  /** "sm" = 44px (grid card constraints), "lg" = 52px (product page, more room). Both meet the ≥44px minimum. */
  size?: "sm" | "lg";
  className?: string;
  /**
   * Этап №8 — renders the "Add to cart" state as a full-width, text-labelled
   * button instead of a bare icon circle, so it unmistakably reads as *the*
   * primary action on the product page. ProductCard's compact grid tiles
   * keep the icon-only look (default false) — there's no room for a label
   * there and it isn't the purchase-decision screen.
   */
  showLabel?: boolean;
}) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const isLoading = useCartStore((s) => s.isLoading);
  const { t, language } = useTranslation();

  const p = product.node;
  const variant = p.variants.edges[0]?.node;
  const cartItem = variant ? items.find((i) => i.variantId === variant.id) : undefined;
  const quantity = cartItem?.quantity ?? 0;
  const translations = useTranslatedTexts([p.title], language);
  const displayTitle = translations[p.title] ?? p.title;

  // 44px ("sm", grid-card constrained) / 48px ("lg", product page — more
  // room, uses the top of the "preferred" 48–56px range from the brief).
  const buttonSizeClass = size === "lg" ? "h-12 w-12" : "h-11 w-11";
  const barHeightClass = size === "lg" ? "h-12" : "h-11";

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    const added = await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    if (added) {
      toast.success(t("product.addedToCartToast"), {
        description: displayTitle,
        position: "top-center",
      });
    }
  };

  const handleStep = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    void updateQuantity(variant.id, quantity + delta);
  };

  // Этап №8, п.7 — out of stock must be obvious immediately, not just a
  // silently-disabled "+" that looks broken. Takes priority over the normal
  // add/stepper states regardless of size/showLabel.
  if (variant && !variant.availableForSale) {
    return (
      <div
        className={`flex ${barHeightClass} shrink-0 items-center justify-center gap-2 rounded-full bg-secondary px-4 text-sm font-medium text-muted-foreground ${className}`}
      >
        <XCircle className="h-4 w-4 shrink-0" />
        {t("product.outOfStock")}
      </div>
    );
  }

  if (quantity <= 0) {
    return (
      <Button
        onClick={handleAdd}
        disabled={isLoading || !variant}
        size={showLabel ? undefined : "icon"}
        variant="default"
        className={
          showLabel
            ? `${barHeightClass} w-full shrink-0 gap-2 rounded-full text-base font-semibold shadow-md ${className}`
            : `${buttonSizeClass} shrink-0 rounded-full ${className}`
        }
        aria-label={t("product.addToCart")}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showLabel ? (
          <>
            <Plus className="h-5 w-5" /> {t("product.addToCart")}
          </>
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <div
      className={`flex ${barHeightClass} shrink-0 items-center justify-between gap-1 rounded-full bg-secondary ${className}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => handleStep(e, -1)}
        disabled={isLoading}
        className={`${buttonSizeClass} shrink-0 rounded-full`}
        aria-label={t("product.decreaseQuantity")}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span
        className="min-w-[1.5rem] flex-1 text-center text-sm font-medium tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => handleStep(e, 1)}
        disabled={isLoading}
        className={`${buttonSizeClass} shrink-0 rounded-full`}
        aria-label={t("product.increaseQuantity")}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
