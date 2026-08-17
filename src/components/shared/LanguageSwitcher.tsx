import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/i18n/languages";

/** Global language switcher — Русский (default) / English, extensible to more languages without changes here. */
export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5" aria-label="Язык / Language">
          <Globe className="h-4 w-4" />
          <span className="text-xs uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={code === language ? "font-semibold" : undefined}
          >
            {LANGUAGE_LABELS[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
