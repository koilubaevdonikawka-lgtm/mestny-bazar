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
      className="group grid grid-cols-2 gap-3 overflow-hidden rounded-2xl bg-white py-3 pr-3 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:gap-4 sm:py-4 sm:pr-4"
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
          Each field is its own background block, stacked. Уточнение к
          Задаче №179 — no border (card separation now comes purely from the
          gap between cards in ProductPage.tsx's list, not a drawn line),
          and each block's own vertical padding/gap roughly halved for a
          denser list. */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="rounded-xl bg-primary px-3 py-1">
          <h3 className="line-clamp-2 text-sm font-medium text-white sm:text-base">
            {displayTitle}
          </h3>
        </div>

        <div className="rounded-xl bg-secondary/60 px-3 py-1">
          <p className="font-serif text-lg font-semibold text-primary sm:text-xl">
            {formatCatalogPrice(parseFloat(price.amount))} {t("product.currencyLabel")}
          </p>
          {p.unit && (
            <p className="text-xs text-muted-foreground">
              {t("product.unit")}: {p.unit}
            </p>
          )}
        </div>

        {(displayDescription || p.manufacturer || p.countryOfOrigin) && (
          <div className="space-y-0.5 rounded-xl bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            {/* Уточнение к Задаче №179 — single line, no wrap: truncate with
                ellipsis instead of line-clamp-2, at a slightly smaller size
                so typical descriptions ("Казахстан второй сорт.") fit
                without wrapping. */}
            {displayDescription && <p className="truncate text-[11px]">{displayDescription}</p>}
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
