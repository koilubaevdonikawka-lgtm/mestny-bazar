import { useEffect } from "react";

/**
 * Makes the Android/browser hardware "Back" button close an open Sheet
 * first, instead of skipping over it and navigating the underlying page
 * away — Radix's Sheet/Dialog has no built-in awareness of the hardware
 * back button, only Escape/outside-click/its own close control (Этап №7
 * navigation audit). Pushes one history entry while open and closes on
 * `popstate`. Does not try to rewind history when the sheet is closed
 * through any other path (its own close button, selecting an option,
 * checkout success) — at most that costs one extra, visually invisible
 * back-press later (same URL), a safer trade-off than manually re-syncing
 * history from every possible close path.
 */
export function useCloseOnBackButton(isOpen: boolean, setIsOpen: (open: boolean) => void) {
  // `setIsOpen` must be a stable reference (e.g. useState's setter, passed
  // directly) — an inline arrow function here would re-push a history entry
  // on every render while open, not just on the open/close transition.
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ overlay: true }, "");
    const handlePopState = () => setIsOpen(false);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, setIsOpen]);
}
