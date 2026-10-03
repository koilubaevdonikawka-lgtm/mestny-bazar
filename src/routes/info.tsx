import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Bell, LogIn, LogOut, MessageCircle, Send } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { isNativePlatform, getPushNotificationCapability } from "@/lib/capabilities";
import { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/config/brand";
import { CONTACT } from "@/config/contact";
import { listPublicDeliveryTariffs } from "@/api/delivery-tariff";
import { deliveryFeeRule } from "@/lib/delivery-admin-view";
import {
  getPublicAdminContactPhone,
  getPublicContactLinks,
  getPublicDeliveryDescription,
} from "@/api/settings";

/**
 * Задача №178 — a real, full-screen, own-URL page for what used to be
 * SiteHeader's "i" icon dialog (moved once already, into BottomTabBar's
 * "Информация" tab as a dialog, Задача №177).
 *
 * Задача №214 — workingHours (static "Пн–Вс, 8:00–22:00") dropped entirely
 * (the store has no fixed hours worth advertising), and the static
 * deliveryPricingInfo hardcode replaced by the real active tariff list from
 * the admin "Доставка" section (isActive=true only, via the public
 * listPublicDeliveryTariffs — no admin auth, PublicDeliveryTariffDTO strips
 * every admin-only field). Loading/error follow this codebase's existing
 * convention for lightweight public lists (e.g. Home's categories query):
 * `data ?? []`, no skeleton/error UI — the block simply renders once data
 * arrives and stays absent otherwise.
 */
export const Route = createFileRoute("/info")({
  component: InfoPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

function InfoPage() {
  const { t, language } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("account.signedOutToast"));
  };
  // Native-only: getPushNotificationCapability() resolves to the unsupported
  // web stub everywhere else, so isSupported() is false there.
  // Задача №216 — requestPermission() itself already never throws (caught
  // internally, resolves "error" instead); this try/catch is an outer
  // safety net so a tap on this button can never take down the app no
  // matter what, per the task's explicit requirement.
  const handleEnableNotifications = async () => {
    try {
      const status = await getPushNotificationCapability().requestPermission();
      if (status === "granted") {
        toast.success(t("push.grantedToast"));
      } else if (status === "denied") {
        toast.error(t("push.deniedToast"));
      } else if (status === "error") {
        toast.error(t("push.errorToast"));
      }
    } catch (error) {
      console.error("[push] handleEnableNotifications failed", error);
      toast.error(t("push.errorToast"));
    }
  };
  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const tariffsQuery = useQuery({
    queryKey: ["public", "delivery-tariffs"],
    queryFn: listPublicDeliveryTariffs,
    staleTime: 60 * 1000,
  });
  const tariffs = tariffsQuery.data ?? [];

  // Задача №274 — same "absent unless the admin actually set something"
  // convention as the tariffs block right below: `data ?? []`/no skeleton
  // here becomes `data ?? null` — the whole block simply doesn't render
  // when unset, never an empty section.
  const contactPhoneQuery = useQuery({
    queryKey: ["public", "admin-contact-phone"],
    queryFn: getPublicAdminContactPhone,
    staleTime: 60 * 1000,
  });
  const contactPhone = contactPhoneQuery.data ?? null;

  // Задача №296 — admin-written delivery description, same "absent unless the
  // admin actually wrote something" convention as the phone block above.
  const deliveryDescriptionQuery = useQuery({
    queryKey: ["public", "delivery-description"],
    queryFn: getPublicDeliveryDescription,
    staleTime: 60 * 1000,
  });
  const deliveryDescription = deliveryDescriptionQuery.data ?? null;

  // Задача №298 — Telegram / WhatsApp buttons, each independent: a blank link
  // hides just its own button, both blank hides the whole row.
  const contactLinksQuery = useQuery({
    queryKey: ["public", "contact-links"],
    queryFn: getPublicContactLinks,
    staleTime: 60 * 1000,
  });
  const telegramLink = contactLinksQuery.data?.telegram ?? null;
  const whatsappLink = contactLinksQuery.data?.whatsapp ?? null;

  const zoneNames = tariffs.map((tariff) => tariff.zoneName);
  const translatedTexts = useTranslatedTexts([BRAND.name, ...zoneNames], language);
  const displayBrandName = translatedTexts[BRAND.name] ?? BRAND.name;

  return (
    <div className="min-h-screen flex flex-col">
      {/* No search on this page — the brand name sits in the search bar's
          slot instead, replacing the old logo + heading + tagline block.
          Language switching lives in the home page header. */}
      <SiteHeader
        safeAreaTop
        showAccountMenu={false}
        showCart={false}
        showSearch={false}
        leftSlot={
          <span className="min-w-0 truncate font-serif text-xl tracking-tight">
            {displayBrandName}
          </span>
        }
      />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-6 sm:px-6">
        <ul className="space-y-3 rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          <li>{t("footer.paymentInfo")}</li>
          {(tariffs.length > 0 || deliveryDescription) && (
            <li>
              <p className="text-foreground">{t("footer.deliveryHeading")}</p>
              {deliveryDescription && (
                <p className="mt-1 whitespace-pre-line">{deliveryDescription}</p>
              )}
              {/* Задача №297 — the real price formula, built from the active tariff
                  itself (same deliveryFeeRule as the admin "Сейчас: …" summary), so
                  it can't drift from what checkout charges. Independent of the
                  hand-written description above. */}
              {tariffs.length > 0 && (
                <ul className="mt-1 space-y-1" data-testid="delivery-fee-rule">
                  {tariffs.map((tariff) => {
                    const rule = deliveryFeeRule({
                      basePrice: tariff.basePrice,
                      weightIncludedKg: tariff.weightIncludedKg,
                      weightExtraFeePerKg: tariff.pricePerExtraKg,
                    });
                    const line = t("footer.deliveryFeeRuleLine", {
                      kg: rule.includedKg,
                      price: rule.baseFee,
                      extra: rule.extraPerKg,
                    });
                    return (
                      <li key={tariff.zoneId}>
                        {tariffs.length > 1
                          ? t("footer.deliveryFeeRuleZoneLine", {
                              zoneName: translatedTexts[tariff.zoneName] ?? tariff.zoneName,
                              rule: line,
                            })
                          : line}
                      </li>
                    );
                  })}
                </ul>
              )}
              <ul className="mt-1 space-y-1">
                {tariffs.map((tariff) => (
                  <li key={tariff.zoneId}>
                    {t("footer.deliveryPerZoneLine", {
                      zoneName: translatedTexts[tariff.zoneName] ?? tariff.zoneName,
                      price: tariff.pricePerExtraKg,
                    })}
                  </li>
                ))}
              </ul>
            </li>
          )}
          {contactPhone && (
            <li>
              <p className="text-foreground">{t("footer.contactPhoneHeading")}</p>
              <p className="mt-1 whitespace-pre-line">{contactPhone}</p>
            </li>
          )}
          {(telegramLink || whatsappLink) && (
            <li className="flex flex-wrap gap-2" data-testid="contact-links">
              {telegramLink && (
                <Button asChild variant="outline" className="justify-start gap-2 rounded-xl">
                  <a href={telegramLink} target="_blank" rel="noopener noreferrer">
                    <Send className="h-4 w-4" />
                    {t("footer.contactTelegramButton")}
                  </a>
                </Button>
              )}
              {whatsappLink && (
                <Button asChild variant="outline" className="justify-start gap-2 rounded-xl">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    {t("footer.contactWhatsappButton")}
                  </a>
                </Button>
              )}
            </li>
          )}
          <li>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">
              {CONTACT.email}
            </a>
          </li>
          <li>
            <Link to="/privacy" className="hover:text-foreground">
              {t("privacy.linkLabel")}
            </Link>
          </li>
          <li>
            <Link to="/account-deletion" className="hover:text-foreground">
              {t("accountDeletion.linkLabel")}
            </Link>
          </li>
        </ul>

        {isAuthenticated === true && (
          <div className="mt-6 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="h-4 w-4" />
              {t("account.signOutFromDialog")}
            </Button>
            {isNativePlatform() && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl"
                onClick={() => void handleEnableNotifications()}
              >
                <Bell className="h-4 w-4" />
                {t("push.enableButton")}
              </Button>
            )}
          </div>
        )}
        {isAuthenticated === false && (
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
              onClick={() => void handleSignIn()}
            >
              <LogIn className="h-4 w-4" />
              {t("common.signIn")}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
