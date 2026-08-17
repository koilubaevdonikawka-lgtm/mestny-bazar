/**
 * Reads the `window.Capacitor` global Capacitor's native runtime injects
 * into the WebView, instead of importing `@capacitor/core` eagerly — that
 * package's `registerPlugin` calls run at module-import time, which would be
 * unsafe to evaluate during SSR. This file never imports a Capacitor package,
 * so it is safe to import from anywhere, including server-rendered code.
 */

export type AppPlatform = "web" | "ios" | "android";

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

const getCapacitorGlobal = (): CapacitorGlobal | undefined => {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
};

export const isNativePlatform = (): boolean => getCapacitorGlobal()?.isNativePlatform?.() ?? false;

export const getPlatform = (): AppPlatform => {
  const platform = getCapacitorGlobal()?.getPlatform?.();
  return platform === "ios" || platform === "android" ? platform : "web";
};
