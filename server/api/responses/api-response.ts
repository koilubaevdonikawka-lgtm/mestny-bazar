/** RFC 9457-inspired problem details structure. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
  errors?: Readonly<Record<string, readonly string[]>>;
}

export interface ApiResponseMeta {
  requestId?: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ProblemDetails;
  meta: ApiResponseMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createSuccessResponse<T>(
  data: T,
  meta: Partial<ApiResponseMeta> = {},
): ApiSuccessResponse<T> {
  return Object.freeze({
    success: true as const,
    data,
    meta: Object.freeze({
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  });
}

export function createErrorResponse(
  error: ProblemDetails,
  meta: Partial<ApiResponseMeta> = {},
): ApiErrorResponse {
  return Object.freeze({
    success: false as const,
    error: Object.freeze({ ...error }),
    meta: Object.freeze({
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  });
}

export function createProblemDetails(input: {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
  errors?: Record<string, readonly string[]>;
}): ProblemDetails {
  return Object.freeze({
    type: input.type ?? "about:blank",
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    code: input.code,
    errors: input.errors ? Object.freeze({ ...input.errors }) : undefined,
  });
}
