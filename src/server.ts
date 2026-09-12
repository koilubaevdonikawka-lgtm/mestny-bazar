import { randomUUID, timingSafeEqual } from "node:crypto";

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { logger } from "@shared/observability/logger";
import { runWithRequestContext } from "@shared/observability/request-context";
import { isDeclaredBodyTooLarge } from "@shared/http/request-limits";
import { isH3SwallowedErrorBody } from "@shared/http/h3-swallowed-error";
import { createRetryableLazy } from "@shared/lib/retryable-lazy";
import { FINIK_WEBHOOK_PATH } from "@shared/contracts/payment";
import { TELEGRAM_WEBHOOK_PATH } from "@shared/contracts/telegram-bot";

// Inline `import(...)` type query, not a static `import type` declaration —
// the no-restricted-imports lint rule (src/** must never import server/**)
// matches any import statement regardless of type-only intent, but doesn't
// see this TS-only, compile-time-erased construct.
type TelegramUpdate = import("@server/adapters/telegram/telegram-update.types").TelegramUpdate;

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

// Задача №264 — same raw-fetch-interception mechanism as the Finik webhook
// above, for the Telegram product-creation bot. Telegram's own header name,
// verified against core.telegram.org/bots/api#setwebhook.
const TELEGRAM_SECRET_HEADER = "x-telegram-bot-api-secret-token";

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

/** Constant-time compare, tolerant of a length mismatch (timingSafeEqual
 * throws instead of returning false when the buffers differ in length). */
function secretsMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

type WaitUntilFn = (promise: Promise<unknown>) => void;

/**
 * Задача №272 — real production traffic proved `ctx` (this file's own
 * `fetch(request, env, ctx)` third parameter) is NOT the live
 * ExecutionContext here: confirmed via wrangler tail, every real Telegram
 * webhook call threw "Cannot read properties of undefined (reading
 * 'waitUntil')" from inside handleTelegramWebhookRequest, caught by the
 * outer try/catch, silently returning {ok:false} 200 — handleUpdate never
 * even started. Root cause, traced through the built output: this app's
 * Nitro `cloudflare-module` preset owns the REAL top-level Worker
 * `fetch(request, env, context)` (see its `_module-handler.mjs`); it stores
 * `env`/`context` onto the request object itself (`req.waitUntil =
 * context.waitUntil.bind(context)`) and then calls `nitroApp.fetch(request)`
 * — a single-argument call. This file's own `export default { fetch(request,
 * env, ctx) }` is invoked further down that same internal dispatch with only
 * `request` forwarded, so `env`/`ctx` are undefined by the time either
 * handler here runs; `request.waitUntil` is the one part of the real
 * ExecutionContext that actually survives that hand-off.
 * Belt-and-braces: prefer `ctx.waitUntil` if some other invocation path ever
 * does pass a real ExecutionContext (e.g. a future Nitro version, or local
 * `wrangler dev`), else use `request.waitUntil`, else block-await the work
 * synchronously — the one thing that must never happen again is a fast
 * "success" response while the update was never processed at all.
 */
function resolveWaitUntil(request: Request, ctx: unknown): WaitUntilFn | null {
  const ctxCandidate = (ctx as { waitUntil?: unknown } | null | undefined)?.waitUntil;
  if (typeof ctxCandidate === "function") {
    return (promise) => (ctxCandidate as WaitUntilFn).call(ctx, promise);
  }
  const requestCandidate = (request as unknown as { waitUntil?: unknown }).waitUntil;
  if (typeof requestCandidate === "function") {
    return requestCandidate as WaitUntilFn;
  }
  return null;
}

async function handleTelegramWebhookRequest(
  request: Request,
  requestId: string,
  ctx: unknown,
): Promise<Response> {
  let response: Response;
  try {
    // Dynamic imports, matching this file's existing getServerEntry()/
    // handleFinikWebhookRequest idiom — see that function's own comment for
    // why (this file has to stay structurally "src/**" despite being
    // genuinely server-only).
    const { getServerEnv } = await import("@server/config/env");
    const configuredSecret = getServerEnv().TELEGRAM_WEBHOOK_SECRET;
    const providedSecret = request.headers.get(TELEGRAM_SECRET_HEADER);

    if (!configuredSecret || !providedSecret || !secretsMatch(configuredSecret, providedSecret)) {
      logger.warn("telegram-bot:webhook-secret-mismatch");
      response = new Response("Unauthorized", { status: 401 });
    } else {
      const update = (await request.json()) as TelegramUpdate;
      const { getServices } = await import("@server/di/container");
      const { telegramBotService } = getServices();
      // Задача №270 — real album traffic showed Telegram delays delivering
      // the next album-member update until THIS webhook call's HTTP
      // response is received. handleUpdate's own work (photo download,
      // Gemini background removal, product creation) routinely takes
      // 15-20s+, so by the time sibling photos arrived, the prior one had
      // already been fully processed and its album claim deleted — each
      // photo ended up "claiming" an empty slot and becoming its own
      // separate product. Running handleUpdate via waitUntil (see
      // resolveWaitUntil above — Задача №272) lets the ACK go back to
      // Telegram immediately while the slow work continues in the
      // background, so every member of a real album lands before any of
      // them finishes processing. Errors can't be reported back to
      // Telegram at this point (the response is already gone) —
      // TelegramBotService already best-effort messages the admin on
      // failure; this catch is just so an unhandled rejection doesn't
      // surface as a bare Worker exception.
      const backgroundWork = telegramBotService.handleUpdate(update).catch((error: unknown) => {
        logger.error("telegram-bot:background-handle-update-failed", { error });
      });
      const waitUntil = resolveWaitUntil(request, ctx);
      if (waitUntil) {
        waitUntil(backgroundWork);
      } else {
        logger.warn("telegram-bot:webhook-no-waituntil-blocking-fallback");
        await backgroundWork;
      }
      response = new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    }
  } catch (error) {
    logger.error("telegram-bot:webhook-unhandled-error", { error });
    // Still 200 — Telegram would otherwise retry-redeliver an update whose
    // failure we've already logged and (best-effort) told the admin about
    // inside TelegramBotService itself; the idempotency table means a
    // retry wouldn't reprocess anyway, but there's no reason to invite one.
    response = new Response(JSON.stringify({ ok: false }), {
      status: 200,
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
      if (request.method === "POST" && new URL(request.url).pathname === TELEGRAM_WEBHOOK_PATH) {
        return handleTelegramWebhookRequest(request, requestId, ctx);
      }
      // Applies to every method — a POST/PUT hitting the technical domain
      // (only realistically a mistyped/bookmarked URL, never Finik: that
      // path is already returned above before this check runs) gets the
      // same 301 as a GET. Only fires for the exact Cloudflare technical
      // host, so mesnyibazar.com and any dev/local host are untouched.
      if (request.headers.get("host") === WORKER_TECHNICAL_HOST) {
        // Hardcoded, not env.APP_URL: a live check right after first deploying
        // this redirect showed the deployed Worker's APP_URL secret actually
        // points at an unrelated leftover domain (daily-goodies-shop.lovable.app,
        // not mesnyibazar.com) — silently wrong until this redirect made it
        // externally observable. Never trust that value for a public redirect
        // target without re-verifying it live; the real domain is the one
        // fixed, known-correct fact here.
        const url = new URL(request.url);
        const response = new Response(null, {
          status: 301,
          headers: { Location: `https://mesnyibazar.com${url.pathname}${url.search}` },
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
