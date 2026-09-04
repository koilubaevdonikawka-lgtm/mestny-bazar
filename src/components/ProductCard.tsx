import { Link } from "@tanstack/react-router";
import { CartQuantityControl } from "@/components/CartQuantityControl";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { formatDisplayPrice } from "@/lib/formatPrice";

/**
 * Задача №179 — vertical-list layout for the subcategory product list
 * (photo left, info column right). Each info element (name/price/quantity)
 * is its own visual block, and the same consumer-facing fields shown on the
 * product detail page (/product/$handle) are surfaced here too: unit,
 * manufacturer, country of origin, description. SKU/barcode/
 * publicationStatus/the delivery-fee weightKg field are never part of
 * CatalogProductNode in the first place (see product-adapter.ts) — nothing
 * to explicitly exclude, they never reach this component.
 *
 * Задача №180 — squeezed further so ~4-5 cards fit on a typical
 * ~700-800px-tall phone viewport: every block's padding is down to the
 * bare minimum that keeps text legible, unit/manufacturer/country are
 * folded onto shared lines instead of their own, and the stepper — the one
 * element the architect explicitly wants "крупный, заметный" — is the only
 * thing NOT shrunk (still the same 48px "lg" CartQuantityControl used
 * before).
 *
 * Задача №253 — photo/info columns are grid-cols-[40%_60%], not an even
 * 50/50 (still the case after Задача №254 below): the info column having
 * more width than the photo (instead of the old "never wider than the
 * photo" cap) gives the description block room to actually read as
 * content next to it.
 *
 * Задача №254 — object-cover (reverted from Задача №252/253's
 * object-contain, on THIS card only): zero beige margins beats zero
 * cropping here, a conscious tradeoff. aspect-[3/4] stays — narrower than
 * the old 4:3/square, so a typical tall bottle photo still loses less to
 * cropping than a wider box would.
 *
 * Задача №256 — overall card height (driven by the photo box, the taller
 * of the grid row's two columns) trimmed by 6%: aspect-[3/4] (w:h ratio
 * 0.75) -> aspect-[75/94] (w:h ratio 0.75/0.94 ≈ 0.7979), i.e. at a fixed
 * column width the box is exactly 6% shorter than before. Photo box only,
 * not text padding — keeps name/description/price fully readable.
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
      className="group grid grid-cols-[40%_60%] gap-2 overflow-hidden rounded-2xl bg-white py-1 pr-1 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:gap-4 sm:py-4 sm:pr-4"
    >
      {/* Задача №254 — back to object-cover, deliberately reverting Задача
          №252's object-contain on THIS card only (a conscious tradeoff,
          per Doniar directly: zero beige margins matters more here than
          zero cropping — the admin catalog card, Задача №240, keeps
          object-contain, that decision is untouched). object-cover always
          fills the box completely, so no padding around the <img> either —
          any padding would itself show as a colored margin against
          bg-secondary regardless of the photo's aspect ratio, which is
          exactly what this is trying to eliminate.
          aspect-[3/4] -> aspect-[75/94] (Задача №256) — same shape, 6%
          shorter at a fixed width; still narrower/taller than the old
          4:3/square, so cropping stays minimal. */}
      <div className="aspect-[75/94] w-full overflow-hidden rounded-xl bg-secondary">
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

      {/* Info column — Задача №253: grid-cols-[40%_60%] (was an even
          grid-cols-2) gives this column more room than the photo, mainly
          so the description block below has space to actually read as
          content rather than mostly empty space next to a narrow photo. */}
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        {/* Задача №202 — Задача №201 swapped bg-primary green for bg-secondary
            beige, which was itself still a colored plate — the actual ask was
            no fill at all. No bg/border here now (rounded-xl dropped too,
            since border-radius is a no-op without a fill/border to round);
            padding kept only to match the price/description blocks' rhythm
            below. text-foreground (not text-primary) mirrors how the product
            detail page (/product/$handle) styles its own <h1> title — plain
            body-text color, no accent — the price is the only place that
            gets text-primary. */}
        <div className="px-2 py-0.5 sm:px-3 sm:py-1">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground sm:text-base">
            {displayTitle}
          </h3>
        </div>

        {/* Задача №205 — reordered below the name: description/variant now
            comes before price (name → description → price → button), price
            moved down to sit right above the Add button. No style/class
            changes on either block, order only.

            Задача №257 — description only: truncate (single-line ellipsis)
            -> line-clamp-2. A description that doesn't fit one line now
            wraps instead of being cut off, capped at two lines so it can't
            unpredictably grow the card past what Задача №256's height trim
            assumed (manufacturerAndCountry below stays single-line
            truncate — out of this task's scope, and it's usually short
            enough that clamping was never the problem there). */}
        {(displayDescription || manufacturerAndCountry) && (
          <div className="rounded-xl bg-white px-2 py-0.5 text-[11px] text-muted-foreground sm:px-3 sm:py-1 sm:text-xs">
            {displayDescription && <p className="line-clamp-2">{displayDescription}</p>}
            {manufacturerAndCountry && <p className="truncate">{manufacturerAndCountry}</p>}
          </div>
        )}

        {/* Задача №201 — dropped the border: it read as a leftover outline
            once the plate had nothing to be "highlighted" against (the card
            itself is already bg-white, same as this block). */}
        <div className="rounded-xl bg-white px-2 py-0.5 sm:px-3 sm:py-1">
          <p className="truncate font-serif text-base font-semibold text-primary sm:text-xl">
            {formatDisplayPrice(parseFloat(price.amount))} {t("product.currencyLabel")}
            {p.unit && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">/ {p.unit}</span>
            )}
          </p>
        </div>

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
