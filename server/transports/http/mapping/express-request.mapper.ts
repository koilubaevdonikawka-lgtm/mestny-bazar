import type { ApiRequestContext, HttpMethod } from "@server/api/server/api.types";
import type { Request } from "express";

export interface ExpressRequestMetadata {
  requestId?: string;
}

export type ExpressRequestWithMetadata = Request & {
  marketplace?: ExpressRequestMetadata;
};

const SUPPORTED_METHODS = new Set<HttpMethod>(["GET", "POST", "PUT", "PATCH", "DELETE"]);

/** Maps Express requests to transport-agnostic API request contexts. */
export class ExpressRequestMapper {
  static toApiRequestContext(request: ExpressRequestWithMetadata): ApiRequestContext {
    const method = normalizeMethod(request.method);
    const path = normalizePath(request);
    const query = normalizeQuery(request.query);
    const headers = normalizeHeaders(request.headers);
    const requestId =
      request.marketplace?.requestId ??
      readHeader(headers, "x-request-id") ??
      undefined;

    return Object.freeze({
      method,
      path,
      params: Object.freeze({ ...request.params }),
      query,
      headers,
      body: request.body,
      requestId,
    });
  }
}

function normalizeMethod(method: string): HttpMethod {
  const normalized = method.toUpperCase();
  if (SUPPORTED_METHODS.has(normalized as HttpMethod)) {
    return normalized as HttpMethod;
  }

  return "GET";
}

function normalizePath(request: Request): string {
  const base = request.baseUrl ?? "";
  const path = request.path ?? "/";
  const combined = `${base}${path}` || "/";
  return combined.endsWith("/") && combined.length > 1 ? combined.slice(0, -1) : combined;
}

function normalizeQuery(
  query: Request["query"],
): Readonly<Record<string, string | string[]>> {
  const normalized: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      normalized[key] = Object.freeze(value.map(String));
      continue;
    }

    normalized[key] = String(value);
  }

  return Object.freeze(normalized);
}

function normalizeHeaders(headers: Request["headers"]): Readonly<Record<string, string>> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }

    normalized[key.toLowerCase()] = Array.isArray(value) ? value.join(", ") : String(value);
  }

  return Object.freeze(normalized);
}

function readHeader(headers: Readonly<Record<string, string>>, name: string): string | undefined {
  return headers[name.toLowerCase()];
}
