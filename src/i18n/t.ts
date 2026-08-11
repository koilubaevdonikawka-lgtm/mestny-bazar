import type { Dictionary } from "./dictionaries/ru";

/** All dot-notation leaf paths of the dictionary, e.g. "common.save" | "cart.total" | ... */
type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : DotPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = DotPaths<Dictionary>;

function resolve(dictionary: Dictionary, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[segment] : undefined,
      dictionary,
    );
  return typeof value === "string" ? value : undefined;
}

/**
 * Looks up `key` in `dictionary`, interpolating `{{param}}` placeholders
 * from `params`. Falls back to the key itself if missing (visibly broken
 * rather than silently blank — easier to spot during development).
 */
export function translate(
  dictionary: Dictionary,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const template = resolve(dictionary, key) ?? key;
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
