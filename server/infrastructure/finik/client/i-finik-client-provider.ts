import type {
  FinikHttpRequestOptions,
  FinikHttpResponse,
} from "@server/infrastructure/finik/shared";

/** Provides HTTP access to the Finik payment API. */
export interface IFinikClientProvider {
  request<T>(options: FinikHttpRequestOptions): Promise<FinikHttpResponse<T>>;
}
