import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { CartPanel } from "@/components/CartPanel";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useCloseOnBackButton } from "@/hooks/useCloseOnBackButton";

interface CartDrawerProps {
  /**
   * Icon-only trigger — no "Ваша корзина" label, no serif text (Часть 1 of
   * the product detail page task). Opt-in, defaults to false so every
   * other caller keeps the current labelled button unchanged.
   */
  iconOnly?: boolean;
}

/**
 * Sheet chrome only — the actual cart content/logic lives in CartPanel
 * (shared with the standalone /cart page, first step toward the mobile
 * bottom-tab-bar navigation; see src/routes/cart.tsx). This stays the
 * header's own trigger for now — swapping it for a tab-bar "Корзина" tab
 * is a separate, later step.
 */
export const CartDrawer = ({ iconOnly = false }: CartDrawerProps = {}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // Этап №7 — Android/browser hardware Back closes the cart first instead
  // of skipping over it and navigating the page underneath away.
  useCloseOnBackButton(isOpen, setIsOpen);
  const { items } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          aria-label={iconOnly ? t("cart.yourCartTitle") : undefined}
          className={
            iconOnly
              ? "relative h-11 w-11 rounded-full p-0 bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90"
              : "relative h-11 rounded-full pl-4 pr-5 gap-2 bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90"
          }
        >
          <ShoppingCart className="h-4 w-4" />
          {!iconOnly && <span className="font-serif text-sm">{t("cart.yourCartTitle")}</span>}
          {totalItems > 0 && (
            <Badge
              aria-label={String(totalItems)}
              className={
                iconOnly
                  ? "absolute -right-1 -top-1 h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-xs bg-destructive text-destructive-foreground border border-primary-foreground/30"
                  : "ml-1 h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-xs bg-destructive text-destructive-foreground border border-primary-foreground/30"
              }
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-serif text-2xl">{t("cart.yourCartTitle")}</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? t("cart.emptyDescription")
              : t(totalItems === 1 ? "cart.itemsInCartOne" : "cart.itemsInCartMany", {
                  count: totalItems,
                })}
          </SheetDescription>
        </SheetHeader>
        <CartPanel
          active={isOpen}
          onNavigate={() => setIsOpen(false)}
          onOrderPlaced={() => setIsOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
