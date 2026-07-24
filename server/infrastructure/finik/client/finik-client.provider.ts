import type { IFinikClientProvider } from "@server/infrastructure/finik/client/i-finik-client-provider";
import type { FinikConfiguration } from "@server/infrastructure/finik/configuration";
import {
  FinikInfrastructureError,
  type FinikHttpRequestOptions,
  type FinikHttpResponse,
} from "@server/infrastructure/finik/shared";

/** Encapsulates Finik HTTP client creation and authenticated requests. */
export class FinikClientProvider implements IFinikClientProvider {
  constructor(private readonly configuration: FinikConfiguration) {
    Object.freeze(this);
  }

  async request<T>(options: FinikHttpRequestOptions): Promise<FinikHttpResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.configuration.timeoutMs);

    try {
      const response = await fetch(`${this.configuration.baseUrl}${options.path}`, {
        method: options.method,
        headers: Object.freeze({
          "content-type": "application/json",
          accept: "application/json",
          "x-api-key": this.configuration.secretKey,
          ...(options.idempotencyKey ? { "idempotency-key": options.idempotencyKey } : {}),
        }),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });

      const text = await response.text();
      const data = text ? (JSON.parse(text) as T) : ({} as T);

      if (!response.ok) {
        const details =
          typeof data === "object" && data !== null && "message" in data
            ? String((data as { message?: string }).message)
            : text;
        throw new FinikInfrastructureError("Finik API request failed", response.status, details);
      }

      return Object.freeze({
        status: response.status,
        data,
      });
    } catch (error) {
      if (error instanceof FinikInfrastructureError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new FinikInfrastructureError("Finik API request timed out", 408);
      }
      throw new FinikInfrastructureError(
        "Finik API request failed",
        undefined,
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

export type { IFinikClientProvider } from "@server/infrastructure/finik/client/i-finik-client-provider";
