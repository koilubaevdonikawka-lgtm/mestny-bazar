/**
 * Задача №153 — generic one-time loader for third-party map SDKs (Yandex
 * Maps JS API, 2GIS MapGL JS API). Caches the in-flight/resolved promise per
 * URL on the script tag itself, so mounting/unmounting the map picker
 * multiple times in one session (switching provider tabs, reopening the
 * dialog) never injects the same <script> twice or re-fetches it.
 */
const scriptPromises = new Map<string, Promise<void>>();

export function loadExternalScript(src: string): Promise<void> {
  const existing = scriptPromises.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const existingTag = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existingTag) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  scriptPromises.set(src, promise);
  // A failed load must not permanently poison future attempts (e.g. a
  // transient network error, or the 2GIS demo key expiring and later being
  // renewed) — let the next call retry from scratch.
  promise.catch(() => scriptPromises.delete(src));

  return promise;
}
