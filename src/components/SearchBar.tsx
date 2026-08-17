import { useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/stores/searchStore";
import { useTranslation } from "@/i18n/LanguageProvider";

/**
 * Header search: clicking/focusing the field opens /search — the dedicated
 * full-catalog list-with-filtering page (src/routes/search.tsx) — instead of
 * an inline dropdown. useSearchStore stays the shared source of truth, so
 * whatever's already typed here (or typed next, once landed on /search)
 * carries over without a separate local input state.
 */
export function SearchBar() {
  const { search, setSearch } = useSearchStore();
  const { t } = useTranslation();
  const router = useRouter();

  const openSearchPage = () => {
    if (window.location.pathname === "/search") return;
    void router.navigate({ to: "/search" });
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
        onFocus={openSearchPage}
        className="h-11 rounded-full pl-11 pr-5"
        aria-label={t("header.searchPlaceholder")}
      />
    </div>
  );
}
