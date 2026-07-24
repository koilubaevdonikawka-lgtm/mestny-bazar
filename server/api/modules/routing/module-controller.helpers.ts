import { ApiValidationError } from "@server/api/errors/api.errors";
import { createSuccessResponse } from "@server/api/responses";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";

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

export function readQueryString(
  query: Readonly<Record<string, string | string[]>>,
  name: string,
): string | undefined {
  const value = query[name];
  if (Array.isArray(value)) {
    return readString(value[0]);
  }
  return readString(value);
}

export function resolveCustomerId(
  context: ApiRequestContext,
  body: Record<string, unknown> = {},
): string {
  const customerId =
    readHeader(context.headers, "x-customer-id") ??
    readString(body.customerId) ??
    readString(body.userId);

  if (!customerId) {
    throw new ApiValidationError({
      customerId: ["customerId is required via x-customer-id header or request body"],
    });
  }

  return customerId;
}

export function resolveAuthorId(
  context: ApiRequestContext,
  body: Record<string, unknown> = {},
): string {
  const authorId =
    readHeader(context.headers, "x-customer-id") ??
    readString(body.authorId) ??
    readString(body.customerId) ??
    readString(body.userId);

  if (!authorId) {
    throw new ApiValidationError({
      authorId: ["authorId is required via x-customer-id header or request body"],
    });
  }

  return authorId;
}
