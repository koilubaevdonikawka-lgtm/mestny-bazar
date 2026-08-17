import { Store } from "lucide-react";
import { BRAND } from "@/config/brand";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";

export function SiteFooter() {
  const { t, language } = useTranslation();
  const brandTranslations = useTranslatedTexts([BRAND.name], language);
  const displayBrandName = brandTranslations[BRAND.name] ?? BRAND.name;

  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Store className="h-4 w-4" />
            </span>
            <span className="font-serif text-xl">{displayBrandName}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t("footer.tagline")}</p>
        </div>
        <div className="text-sm">
          <h4 className="font-medium mb-3">{t("footer.shopHeading")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>{t("nav.categories")}</li>
            <li>{t("home.productsHeading")}</li>
            <li>{t("header.deliveryLink")}</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-medium mb-3">{t("footer.contactsHeading")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>{t("footer.workingHours")}</li>
            <li>{t("footer.paymentInfo")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-muted-foreground">
          {t("footer.copyright", { year: new Date().getFullYear(), brand: displayBrandName })}
        </div>
      </div>
    </footer>
  );
}
