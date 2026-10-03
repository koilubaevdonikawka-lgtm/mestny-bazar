import { useTranslation } from "@/i18n/LanguageProvider";

/**
 * What an account deletion removes and what it keeps anonymized — one list
 * shared by the in-app deletion screen (/profile/delete-account) and the public
 * /account-deletion page, so the two can never describe it differently. Mirrors
 * erase_customer_account_data() + the auth user deletion
 * (supabase/migrations/20261003010000_account_self_deletion.sql).
 */
export function AccountDeletionDataSummary() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-sm leading-relaxed">
      <section className="space-y-2">
        <h2 className="font-serif text-xl tracking-tight">{t("accountDeletion.deletedHeading")}</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("accountDeletion.deletedProfile")}</li>
          <li>{t("accountDeletion.deletedAddresses")}</li>
          <li>{t("accountDeletion.deletedCart")}</li>
          <li>{t("accountDeletion.deletedDevices")}</li>
          <li>{t("accountDeletion.deletedLogin")}</li>
          <li>{t("accountDeletion.deletedLocal")}</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="font-serif text-xl tracking-tight">{t("accountDeletion.keptHeading")}</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("accountDeletion.keptOrders")}</li>
          <li>{t("accountDeletion.keptAudit")}</li>
        </ul>
      </section>
    </div>
  );
}
