import { Link } from "@tanstack/react-router";
import { CartQuantityControl } from "@/components/CartQuantityControl";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";

/**
 * Задача №179 — whole-number display price ("1 сом", not "1.00 KGS"),
 * rounded defensively: production has no non-integer prices today, but
 * `price` is a plain `number` in the schema with no integer constraint, so
 * a future non-integer price rounds to the nearest whole number rather than
 * silently truncating or crashing. Deliberately separate from formatMoney
 * (shared/lib/order-display.ts) — that formatter is shared by cart/checkout/
 * order-history screens showing real transacted totals, out of scope for
 * this catalog-card-only price format change.
 */
function formatCatalogPrice(amount: number): string {
  return `${Math.round(amount)}`;
}

/**
 * Задача №179 — vertical-list layout for the subcategory product list
 * (photo left, info column right, info column's width capped at the
 * photo's own width via the 2-column grid — never wider than the photo).
 * Each info element (name/price/quantity) is its own visual block, and the
 * same consumer-facing fields shown on the product detail page
 * (/product/$handle) are surfaced here too: unit, manufacturer, country of
 * origin, description. SKU/barcode/publicationStatus/the delivery-fee
 * weightKg field are never part of CatalogProductNode in the first place
 * (see product-adapter.ts) — nothing to explicitly exclude, they never
 * reach this component.
 */
export function ProductCard({ product }: { product: CatalogProductNode }) {
  const { t, language } = useTranslation();

  const p = product.node;
  const image = p.images.edges[0]?.node;
  const price = p.priceRange.minVariantPrice;
  const translations = useTranslatedTexts([p.title, p.description], language);
  const displayTitle = translations[p.title] ?? p.title;
  const displayDescription = p.description ? (translations[p.description] ?? p.description) : null;

  return (
    <Link
      to="/product/$handle"
      params={{ handle: p.handle }}
      className="group grid grid-cols-2 gap-3 overflow-hidden rounded-2xl border-2 border-primary bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:gap-4 sm:p-4"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-secondary">
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

      {/* Info column — same width as the photo (2-col grid), never wider.
          Each field is its own bordered/background block, stacked. */}
      <div className="flex min-w-0 flex-col gap-2">
        <div className="rounded-xl bg-primary px-3 py-2">
          <h3 className="line-clamp-2 text-sm font-medium text-white sm:text-base">
            {displayTitle}
          </h3>
        </div>

        <div className="rounded-xl bg-secondary/60 px-3 py-2">
          <p className="font-serif text-lg font-semibold text-primary sm:text-xl">
            {formatCatalogPrice(parseFloat(price.amount))} {t("product.currencyLabel")}
          </p>
          {p.unit && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("product.unit")}: {p.unit}
            </p>
          )}
        </div>

        {(displayDescription || p.manufacturer || p.countryOfOrigin) && (
          <div className="space-y-1 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            {displayDescription && <p className="line-clamp-2">{displayDescription}</p>}
            {p.manufacturer && (
              <p className="truncate">
                {t("category.manufacturerLabel")}: {p.manufacturer}
              </p>
            )}
            {p.countryOfOrigin && (
              <p className="truncate">
                {t("category.countryLabel")}: {p.countryOfOrigin}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto">
          <CartQuantityControl
            product={product}
            size="lg"
            showLabel
            addLabel={t("product.addToCartShort")}
            unit={p.unit}
            className="w-full"
          />
        </div>
      </div>
    </Link>
  );
}
