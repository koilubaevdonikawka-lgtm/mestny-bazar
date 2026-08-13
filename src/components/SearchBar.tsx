import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/stores/searchStore";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchCatalogProducts } from "@/lib/catalog";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";

const DROPDOWN_RESULT_LIMIT = 6;
const MIN_QUERY_LENGTH = 2;
/** Blur fires before a click on a dropdown item; delaying the close lets the click land first. */
const BLUR_CLOSE_DELAY_MS = 150;

/**
 * Header search: live dropdown preview (up to DROPDOWN_RESULT_LIMIT matches,
 * server-side, same fetchCatalogProducts({search}) the home page already
 * uses) plus a full /search results page for everything else. Works from
 * any page — unlike the home page's own live-filtered grid (still unchanged,
 * still the nicer in-place experience while actually on "/"), this is what
 * makes typing in the header search box do something visible everywhere
 * else (product page, checkout, orders, ...), where nothing previously
 * consumed useSearchStore's value at all.
 */
export function SearchBar() {
  const { search, setSearch } = useSearchStore();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const query = debouncedSearch.length >= MIN_QUERY_LENGTH ? debouncedSearch : "";

  const { data, isFetching } = useQuery({
    queryKey: ["search-dropdown", query],
    queryFn: () => fetchCatalogProducts({ search: query }),
    enabled: query.length > 0,
  });

  const items = data?.items.slice(0, DROPDOWN_RESULT_LIMIT) ?? [];
  const translations = useTranslatedTexts(
    items.map((item) => item.node.title),
    language,
  );

  const open = focused && query.length > 0;

  const goToResultsPage = () => {
    setSearch("");
    setFocused(false);
    void navigate({ to: "/search", search: { q: query } });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.length > 0) {
      goToResultsPage();
    } else if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  };

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setFocused(true);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setFocused(false), BLUR_CLOSE_DELAY_MS);
  };

  const handleResultClick = () => {
    setSearch("");
    setFocused(false);
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        inputMode="search"
        placeholder={t("header.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-11 rounded-full pl-11 pr-5"
        aria-label={t("header.searchPlaceholder")}
      />

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border/60 bg-card shadow-lg">
          {isFetching && items.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("common.loading")}
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t("home.noResultsTitle")}
            </p>
          ) : (
            <>
              <ul>
                {items.map((item) => {
                  const p = item.node;
                  const image = p.images.edges[0]?.node;
                  const price = p.priceRange.minVariantPrice;
                  return (
                    <li key={p.handle}>
                      <Link
                        to="/product/$handle"
                        params={{ handle: p.handle }}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-secondary"
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          {image && (
                            <img
                              src={image.url}
                              alt={image.altText || p.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {translations[p.title] ?? p.title}
                        </span>
                        <span className="shrink-0 text-sm font-medium text-primary">
                          {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {data && data.total > items.length && (
                <button
                  type="button"
                  onClick={goToResultsPage}
                  className="block w-full border-t border-border/60 px-4 py-3 text-center text-sm font-medium text-primary hover:bg-secondary"
                >
                  {t("search.viewAllResults", { count: data.total })}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
