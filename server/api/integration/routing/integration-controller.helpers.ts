import { createSuccessResponse } from "@server/api/responses";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";

/** Shared JSON response helpers for integration controllers. */
export function createJsonResponse(
  context: ApiRequestContext,
  data: unknown,
  status = 200,
): ApiResponseEnvelope {
  return Object.freeze({
    status,
    headers: Object.freeze({ "content-type": "application/json" }),
    body: createSuccessResponse(data, { requestId: context.requestId }),
  });
}

export function readRecordBody(body: unknown): Record<string, unknown> {
  if (typeof body === "object" && body !== null && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }
  return {};
}

export function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function readHeader(
  headers: Readonly<Record<string, string>>,
  name: string,
): string | undefined {
  return headers[name.toLowerCase()];
}
