import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Runs fn with a request-scoped correlation id available to any server-side
 * code executed during it (via getRequestId()) — no need to thread an id
 * parameter through every call in the checkout -> inventory -> order ->
 * event-bus chain. Call this once, at the top of the request (src/server.ts).
 */
export function runWithRequestContext<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}

/** The current request's correlation id, or undefined outside any request
 * (e.g. module init) or in code paths that never ran through
 * runWithRequestContext (tests). */
export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
