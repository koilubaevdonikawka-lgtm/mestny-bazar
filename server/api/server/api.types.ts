/** Framework-agnostic HTTP method set. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Incoming API request context — transport-agnostic. */
export interface ApiRequestContext {
  method: HttpMethod;
  path: string;
  params: Readonly<Record<string, string>>;
  query: Readonly<Record<string, string | string[]>>;
  headers: Readonly<Record<string, string>>;
  body: unknown;
  rawBody?: string;
  requestId?: string;
}

/** Outgoing API response envelope — transport-agnostic. */
export interface ApiResponseEnvelope {
  status: number;
  headers: Readonly<Record<string, string>>;
  body: unknown;
}

export type ApiNextHandler = (context: ApiRequestContext) => Promise<ApiResponseEnvelope>;

export type ApiMiddlewareHandler = (
  context: ApiRequestContext,
  next: ApiNextHandler,
) => Promise<ApiResponseEnvelope>;

export type ApiRouteHandler = (context: ApiRequestContext) => Promise<ApiResponseEnvelope>;

export interface ApiRouteDefinition {
  method: HttpMethod;
  path: string;
  handler: ApiRouteHandler;
}

export interface ApiLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
