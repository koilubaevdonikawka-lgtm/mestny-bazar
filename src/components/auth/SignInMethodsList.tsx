import type { ReactNode } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TelegramLoginButton } from "@/components/TelegramLoginButton";
import { useTranslation } from "@/i18n/LanguageProvider";
import { signInWithGoogle } from "@/lib/auth";

/**
 * Задача №303 — one list of sign-in methods, one place their logic lives.
 * Every call site (AccountMenu's header popover, RegisterPromptDialog,
 * addresses.tsx) renders this same component instead of hand-rolling its
 * own Google button + TelegramLoginButton + divider, so adding a method
 * later (WhatsApp) is one new entry here, not three repeated edits.
 *
 * Three kinds, not one uniform "button" shape, because the methods
 * genuinely aren't uniform:
 * - "action" — a plain button that performs sign-in itself on click
 *   (Google: signInWithGoogle() is a real OAuth redirect, nothing to render
 *   beyond a label).
 * - "widget" — arbitrary embedded content this component must render
 *   as-is (Telegram: TelegramLoginButton IS the official
 *   telegram-widget.js iframe; wrapping it in a generic <Button> would
 *   mean either re-triggering it programmatically, which Telegram's widget
 *   does not support, or losing the iframe — neither is acceptable, so
 *   this list renders its `content` directly instead of a label+onClick).
 * - "step" (reserved, not implemented yet) — for a future method whose
 *   first tap doesn't sign in directly but opens another surface first
 *   (WhatsApp: a phone-number input before anything is sent). Modeled now
 *   as a third union member with its own `render(props)` so adding it
 *   later is one new object in `methods` below plus one new case in the
 *   switch, not a rewrite of this component or of any of its three callers.
 */
export type SignInMethodAction = {
  kind: "action";
  id: string;
  label: string;
  onSelect: () => void;
};

export type SignInMethodWidget = {
  kind: "widget";
  id: string;
  content: ReactNode;
};

/**
 * Not used yet (no method below is this kind) — kept in the union so the
 * render switch and every call site's type already account for it. A
 * future WhatsApp entry would push a `{ kind: "step", ... }` object into
 * `methods` and add one `case "step":` arm to the switch; onStepChange
 * lets the container (e.g. a Dialog) know a sub-view is open, so it can
 * keep itself from closing on outside-click the way it might for a plain
 * one-tap method.
 */
export type SignInMethodStep = {
  kind: "step";
  id: string;
  label: string;
  render: (props: { onBack: () => void }) => ReactNode;
};

export type SignInMethod = SignInMethodAction | SignInMethodWidget | SignInMethodStep;

export interface SignInMethodsListProps {
  /** Called right before an "action" method's onSelect runs (e.g. close the popover it's inside) — omit when the container doesn't need to react, like a Dialog that's about to navigate away anyway. */
  onActionSelected?: () => void;
  className?: string;
}

export function SignInMethodsList({ onActionSelected, className }: SignInMethodsListProps) {
  const { t } = useTranslation();

  const methods: SignInMethod[] = [
    {
      kind: "action",
      id: "google",
      label: t("auth.signInWithGoogle"),
      onSelect: () => void signInWithGoogle(),
    },
    {
      kind: "widget",
      id: "telegram",
      content: <TelegramLoginButton />,
    },
  ];

  return (
    <div className={className ?? "flex flex-col items-stretch gap-2"}>
      {methods.map((method) => {
        switch (method.kind) {
          case "action":
            return (
              <Button
                key={method.id}
                variant="outline"
                className="h-11 w-full justify-center gap-2 rounded-full"
                onClick={() => {
                  onActionSelected?.();
                  method.onSelect();
                }}
              >
                <LogIn className="h-4 w-4" />
                {method.label}
              </Button>
            );
          case "widget":
            return (
              <div key={method.id} className="flex justify-center">
                {method.content}
              </div>
            );
          case "step":
            // Reserved — see SignInMethodStep's own doc comment above.
            return null;
        }
      })}
    </div>
  );
}
