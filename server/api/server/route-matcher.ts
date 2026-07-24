import type { ApiRouteDefinition, HttpMethod } from "@server/api/server/api.types";

export interface MatchedRoute {
  handler: ApiRouteDefinition["handler"];
  params: Readonly<Record<string, string>>;
}

/** Matches incoming paths against registered route patterns. */
export function matchRoute(
  routes: readonly ApiRouteDefinition[],
  method: HttpMethod,
  path: string,
): MatchedRoute | null {
  const normalizedPath = normalizePath(path);

  for (const route of routes) {
    const params = matchPathPattern(normalizePath(route.path), normalizedPath);
    if (params !== null && route.method === method) {
      return Object.freeze({
        handler: route.handler,
        params: Object.freeze(params),
      });
    }
  }

  return null;
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed === "" || trimmed === "/") {
    return "/";
  }

  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.endsWith("/") && withLeading.length > 1
    ? withLeading.slice(0, -1)
    : withLeading;
}

function matchPathPattern(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }

    if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}
