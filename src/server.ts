import { randomUUID } from "node:crypto";

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { logger } from "@shared/observability/logger";
import { runWithRequestContext } from "@shared/observability/request-context";
import { isDeclaredBodyTooLarge } from "@shared/http/request-limits";

const REQUEST_ID_HEADER = "x-request-id";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

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

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
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
