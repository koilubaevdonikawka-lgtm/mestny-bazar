import { Link } from "@tanstack/react-router";
import { CartQuantityControl } from "@/components/CartQuantityControl";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";

export function ProductCard({ product }: { product: CatalogProductNode }) {
  const { t, language } = useTranslation();

  const p = product.node;
  const image = p.images.edges[0]?.node;
  const price = p.priceRange.minVariantPrice;
  const translations = useTranslatedTexts([p.title], language);
  const displayTitle = translations[p.title] ?? p.title;

  return (
    <Link
      to="/product/$handle"
      params={{ handle: p.handle }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border-2 border-primary bg-white transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] sm:rounded-2xl"
    >
      <div className="aspect-square w-full overflow-hidden bg-secondary relative">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || displayTitle}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            {t("common.noPhoto")}
          </div>
        )}
      </div>
      <div className="px-3 py-2 sm:px-5 sm:py-3">
        <p className="font-serif text-sm text-primary sm:text-lg">
          {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
        </p>
        {/* Этап №4 — toggles between "Add to cart" and the [-] qty [+]
            stepper on its own, based on this product's actual quantity in
            the shared cart store; full width so both states share the same
            footprint (no card height/width jump when it toggles). */}
        <div className="mt-2">
          <CartQuantityControl product={product} size="sm" className="w-full" />
        </div>
      </div>
      <div className="mt-auto bg-primary px-3 py-2 sm:px-5 sm:py-3">
        <h3 className="truncate text-sm font-medium text-white sm:text-base">{displayTitle}</h3>
      </div>
    </Link>
  );
}
