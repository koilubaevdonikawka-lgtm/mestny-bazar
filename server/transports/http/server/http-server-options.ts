/** HTTP transport server configuration. */
export interface CorsOptions {
  enabled: boolean;
  origin?: string;
  methods?: readonly string[];
  allowedHeaders?: readonly string[];
  credentials?: boolean;
}

/** HTTP transport server configuration. */
export interface HttpServerOptions {
  host?: string;
  port?: number;
  cors?: boolean | CorsOptions;
  jsonLimit?: string;
  compression?: boolean;
  trustProxy?: boolean | number | string;
}

export const DEFAULT_HTTP_SERVER_OPTIONS: Readonly<Required<Pick<HttpServerOptions, "host" | "port" | "jsonLimit" | "compression" | "trustProxy">>> =
  Object.freeze({
    host: "0.0.0.0",
    port: 3000,
    jsonLimit: "1mb",
    compression: true,
    trustProxy: false,
  });

export function resolveHttpServerOptions(
  options: HttpServerOptions = {},
): Required<Pick<HttpServerOptions, "host" | "port" | "jsonLimit" | "compression" | "trustProxy">> &
  Pick<HttpServerOptions, "cors"> {
  return {
    host: options.host ?? DEFAULT_HTTP_SERVER_OPTIONS.host,
    port: options.port ?? DEFAULT_HTTP_SERVER_OPTIONS.port,
    jsonLimit: options.jsonLimit ?? DEFAULT_HTTP_SERVER_OPTIONS.jsonLimit,
    compression: options.compression ?? DEFAULT_HTTP_SERVER_OPTIONS.compression,
    trustProxy: options.trustProxy ?? DEFAULT_HTTP_SERVER_OPTIONS.trustProxy,
    cors: options.cors,
  };
}

export function resolveCorsOptions(cors: HttpServerOptions["cors"]): CorsOptions {
  if (cors === false || cors === undefined) {
    return Object.freeze({ enabled: false });
  }

  if (cors === true) {
    return Object.freeze({
      enabled: true,
      origin: "*",
      methods: Object.freeze(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]),
      allowedHeaders: Object.freeze(["Content-Type", "Authorization", "X-Request-Id"]),
      credentials: false,
    });
  }

  return Object.freeze({
    enabled: true,
    origin: cors.origin ?? "*",
    methods: cors.methods ?? ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: cors.allowedHeaders ?? ["Content-Type", "Authorization", "X-Request-Id"],
    credentials: cors.credentials ?? false,
  });
}
