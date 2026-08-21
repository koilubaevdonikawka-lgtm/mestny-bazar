import { randomUUID } from "node:crypto";

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { logger } from "@shared/observability/logger";
import { runWithRequestContext } from "@shared/observability/request-context";
import { isDeclaredBodyTooLarge } from "@shared/http/request-limits";
import { isH3SwallowedErrorBody } from "@shared/http/h3-swallowed-error";
import { createRetryableLazy } from "@shared/lib/retryable-lazy";
import { FINIK_WEBHOOK_PATH } from "@shared/contracts/payment";

const REQUEST_ID_HEADER = "x-request-id";
// TanStack Start's own router owns every other path in this app — API routes
// (createServerFileRoute) aren't available in the installed version, and
// Nitro's server/routes/** auto-registration was confirmed (via a live curl
// against the dev server) not to be active in this Vite-plugin-nested Nitro
// setup. This is the only mechanism confirmed to make a raw HTTP webhook
// endpoint reachable here — intercepted before the router ever sees it.
// `/api/webhooks/finik` is our own URL, not Finik-dictated — the single
// shared constant also backs `Data.webhookUrl` in payment.service.ts, so
// the two can never drift apart. The `signature` header carries the
// signature itself; every `x-api-*` header is part of what gets signed
// (Промпт №080, via @mancho.devs/authorizer's Signer).
const FINIK_SIGNATURE_HEADER = "signature";
const X_API_HEADER_PREFIX = "x-api-";

// Cloudflare's own auto-generated technical domain for this Worker (confirmed
// from real `wrangler deploy` output, not guessed — see wrangler.json's
// generated `name`). The browser treats this and mesnyibazar.com as two
// unrelated origins — a session/login on one is invisible on the other —
// so the technical domain must always bounce to the real one. Exact string
// equality, never "anything != mesnyibazar.com": a host check that broad
// would also redirect localhost/wrangler-dev during local development.
const WORKER_TECHNICAL_HOST = "koilubaevdonikawka-lgtm-mestny-bazar.koilubaevdonikawka.workers.dev";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const getServerEntry = createRetryableLazy(() =>
  import("@tanstack/react-start/server-entry").then((m) => (m.default ?? m) as ServerEntry),
);

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  logger.error("h3 swallowed SSR error", {
    error: consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`),
  });
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function handleFinikWebhookRequest(request: Request, requestId: string): Promise<Response> {
  let response: Response;
  try {
    // Raw text, read once — RSA signature verification needs the exact
    // bytes Finik signed, not a re-serialized JSON.parse/stringify round trip.
    const rawBody = await request.text();
    const signature = request.headers.get(FINIK_SIGNATURE_HEADER);
    const url = new URL(request.url);
    const xApiHeaders: Record<string, string> = {};
    for (const [key, value] of request.headers.entries()) {
      if (key.toLowerCase().startsWith(X_API_HEADER_PREFIX)) xApiHeaders[key.toLowerCase()] = value;
    }
    const requestMeta = {
      httpMethod: request.method,
      path: url.pathname,
      host: request.headers.get("host") ?? url.host,
      headers: xApiHeaders,
      queryStringParameters: url.search ? Object.fromEntries(url.searchParams.entries()) : null,
    };
    // Dynamic import, matching this file's existing getServerEntry() idiom —
    // src/server.ts is the framework-mandated Worker entry filename (not
    // renameable to *.server.ts), so it stays structurally "src/**" despite
    // being genuinely server-only; a static top-level import here would
    // pull server/** into the same module graph analysis as real
    // client-bundled src/** code, so it stays lazy like every other
    // cross-boundary reference already in this file.
    const { getServices } = await import("@server/di/container");
    const { handlePaymentWebhook } = await import("@server/domain/payment-webhook-handler");
    const { paymentService } = getServices();
    const result = await handlePaymentWebhook(rawBody, signature, requestMeta, paymentService);
    response = new Response(result.body, {
      status: result.status,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    logger.error("payment:webhook-unhandled-error", { error });
    response = new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export default {
  fetch(request: Request, env: unknown, ctx: unknown): Promise<Response> {
    const requestId = randomUUID();
    return runWithRequestContext(requestId, async () => {
      if (isDeclaredBodyTooLarge(request)) {
        logger.warn("Rejected oversized request body", {
          method: request.method,
          url: request.url,
          contentLength: request.headers.get("content-length"),
        });
        const response = new Response("Request Entity Too Large", { status: 413 });
        response.headers.set(REQUEST_ID_HEADER, requestId);
        return response;
      }
      if (request.method === "POST" && new URL(request.url).pathname === FINIK_WEBHOOK_PATH) {
        return handleFinikWebhookRequest(request, requestId);
      }
      // Applies to every method — a POST/PUT hitting the technical domain
      // (only realistically a mistyped/bookmarked URL, never Finik: that
      // path is already returned above before this check runs) gets the
      // same 301 as a GET. Only fires for the exact Cloudflare technical
      // host, so mesnyibazar.com and any dev/local host are untouched.
      if (request.headers.get("host") === WORKER_TECHNICAL_HOST) {
        const { getServerEnv } = await import("@server/config/env");
        const appUrl = getServerEnv().APP_URL ?? "https://mesnyibazar.com";
        const url = new URL(request.url);
        const response = new Response(null, {
          status: 301,
          headers: { Location: `${appUrl}${url.pathname}${url.search}` },
        });
        response.headers.set(REQUEST_ID_HEADER, requestId);
        return response;
      }
      try {
        const handler = await getServerEntry();
        const response = await handler.fetch(request, env, ctx);
        const normalized = await normalizeCatastrophicSsrResponse(response);
        normalized.headers.set(REQUEST_ID_HEADER, requestId);
        return normalized;
      } catch (error) {
        logger.error("Unhandled error in top-level fetch handler", { error });
        const response = new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
        response.headers.set(REQUEST_ID_HEADER, requestId);
        return response;
      }
    });
  },
};
