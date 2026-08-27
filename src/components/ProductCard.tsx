import { Link } from "@tanstack/react-router";
import { CartQuantityControl } from "@/components/CartQuantityControl";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { formatDisplayPrice } from "@/lib/formatPrice";

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
 *
 * Задача №180 — squeezed further so ~4-5 cards fit on a typical
 * ~700-800px-tall phone viewport: photo is a shorter 4:3 rectangle instead
 * of a square, every block's padding is down to the bare minimum that keeps
 * text legible, unit/manufacturer/country are folded onto shared lines
 * instead of their own, and the stepper — the one element the architect
 * explicitly wants "крупный, заметный" — is the only thing NOT shrunk
 * (still the same 48px "lg" CartQuantityControl used before).
 */
export function ProductCard({ product }: { product: CatalogProductNode }) {
  const { t, language } = useTranslation();

  const p = product.node;
  const image = p.images.edges[0]?.node;
  const price = p.priceRange.minVariantPrice;
  const translations = useTranslatedTexts([p.title, p.description], language);
  const displayTitle = translations[p.title] ?? p.title;
  const displayDescription = p.description ? (translations[p.description] ?? p.description) : null;
  const manufacturerAndCountry = [p.manufacturer, p.countryOfOrigin].filter(Boolean).join(", ");

  return (
    <Link
      to="/product/$handle"
      params={{ handle: p.handle }}
      className="group grid grid-cols-2 gap-2 overflow-hidden rounded-2xl bg-white py-1 pr-1 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:gap-4 sm:py-4 sm:pr-4"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary sm:aspect-square">
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
          Each field is its own background block, stacked. Задача №180 —
          padding/gaps trimmed to the minimum that keeps text legible;
          unit and manufacturer/country folded onto shared lines instead of
          separate ones, to keep the whole column shorter than the photo. */}
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <div className="rounded-xl bg-primary px-2 py-0.5 sm:px-3 sm:py-1">
          <h3 className="line-clamp-2 text-sm font-medium text-white sm:text-base">
            {displayTitle}
          </h3>
        </div>

        {/* Задача №194 — white instead of the beige --secondary fill; the
            card itself is already bg-white, so a border is the only thing
            that still separates this field from its own background. */}
        <div className="rounded-xl border border-border/60 bg-white px-2 py-0.5 sm:px-3 sm:py-1">
          <p className="truncate font-serif text-base font-semibold text-primary sm:text-xl">
            {formatDisplayPrice(parseFloat(price.amount))} {t("product.currencyLabel")}
            {p.unit && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">/ {p.unit}</span>
            )}
          </p>
        </div>

        {(displayDescription || manufacturerAndCountry) && (
          <div className="rounded-xl border border-border/60 bg-white px-2 py-0.5 text-[11px] text-muted-foreground sm:px-3 sm:py-1 sm:text-xs">
            {displayDescription && <p className="truncate">{displayDescription}</p>}
            {manufacturerAndCountry && <p className="truncate">{manufacturerAndCountry}</p>}
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
