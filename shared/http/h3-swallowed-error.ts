/**
 * h3 (Nitro's HTTP layer) swallows in-handler throws into a generic 500
 * Response with this exact JSON shape — a plain try/catch around the
 * handler call never fires for those, since h3 already converted the throw
 * into a normal (non-throwing) Response before src/server.ts's fetch() gets
 * a chance to see it. Used to detect that case so the original error can be
 * recovered (via error-capture.ts) and logged instead of silently returning
 * an opaque JSON body to the client.
 */
export function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}
