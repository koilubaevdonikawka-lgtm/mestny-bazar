/** Normalized Finik API payment status values. */
export type FinikPaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED";

/** Raw Finik payment resource returned by the HTTP API. */
export interface FinikPaymentResource {
  readonly id: string;
  readonly orderId?: string;
  readonly accountId?: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly status?: FinikPaymentStatus | string;
  readonly paymentUrl?: string | null;
  readonly callbackUrl?: string | null;
  readonly capturedAt?: string | null;
  readonly fields?: Readonly<Record<string, string>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Finik webhook payload shape. */
export interface FinikWebhookPayload {
  readonly id: string;
  readonly status: FinikPaymentStatus | string;
  readonly amount?: number;
  readonly currency?: string;
  readonly fields?: Readonly<Record<string, string>>;
  readonly transactionId?: string;
  readonly occurredAt?: string;
}

export interface FinikHttpRequestOptions {
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly path: string;
  readonly body?: unknown;
  readonly idempotencyKey?: string;
}

export interface FinikHttpResponse<T> {
  readonly status: number;
  readonly data: T;
}
