import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import { getServerEnv } from "@server/config/env";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { ForbiddenError, UnauthorizedError } from "@server/domain/orders.errors";
import type { UserRole } from "@shared/contracts/user";

export function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

// resolveUserIdFromRequest() runs on every admin/warehouse/courier/seller
// request via requireXFromRequest() — an unreachable or hanging Supabase auth
// endpoint (e.g. the JWKS fetch inside getClaims()) must not be able to hang
// every authenticated request indefinitely.
const AUTH_FETCH_TIMEOUT_MS = 5000;

export function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, {
      ...init,
      headers,
      signal: init?.signal ?? AbortSignal.timeout(AUTH_FETCH_TIMEOUT_MS),
    });
  };
}

/**
 * Resolves authenticated user id from Bearer JWT on the incoming request.
 * Returns null for guests (no header or invalid token) — used for ONLINE checkout.
 */
export async function resolveUserIdFromRequest(): Promise<string | null> {
  const env = getServerEnv();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!publishableKey) return null;

  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token || token.split(".").length !== 3) return null;

  const supabase = createClient(env.SUPABASE_URL, publishableKey, {
    global: {
      fetch: createSupabaseFetch(publishableKey),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub;
}

/** Requires a valid JWT; throws if the caller is not authenticated. */
export async function requireUserIdFromRequest(): Promise<string> {
  const userId = await resolveUserIdFromRequest();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

/** Resolves roles for an authenticated user id (server-side, after JWT validation). */
export async function resolveRolesForUser(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to resolve user roles: ${error.message}`);
  }

  return (data ?? []).map((row) => row.role as UserRole);
}

export interface AuthenticatedAdmin {
  userId: string;
  roles: UserRole[];
}

/** Requires JWT + admin role; userId and roles are never taken from the request body. */
export async function requireAdminFromRequest(): Promise<AuthenticatedAdmin> {
  const userId = await requireUserIdFromRequest();
  const roles = await resolveRolesForUser(userId);
  if (!roles.includes("admin")) {
    throw new ForbiddenError("Admin role required");
  }
  return { userId, roles };
}

export interface AuthenticatedWarehouse {
  userId: string;
  roles: UserRole[];
}

/** Requires JWT + warehouse role; userId and roles are never taken from the request body. */
export async function requireWarehouseFromRequest(): Promise<AuthenticatedWarehouse> {
  const userId = await requireUserIdFromRequest();
  const roles = await resolveRolesForUser(userId);
  if (!roles.includes("warehouse")) {
    throw new ForbiddenError("Warehouse role required");
  }
  return { userId, roles };
}

export interface AuthenticatedCourier {
  userId: string;
  roles: UserRole[];
}

/** Requires JWT + courier role; userId and roles are never taken from the request body. */
export async function requireCourierFromRequest(): Promise<AuthenticatedCourier> {
  const userId = await requireUserIdFromRequest();
  const roles = await resolveRolesForUser(userId);
  if (!roles.includes("courier")) {
    throw new ForbiddenError("Courier role required");
  }
  return { userId, roles };
}

export interface AuthenticatedSeller {
  userId: string;
  roles: UserRole[];
}

/** Requires JWT + seller role; userId and roles are never taken from the request body. */
export async function requireSellerFromRequest(): Promise<AuthenticatedSeller> {
  const userId = await requireUserIdFromRequest();
  const roles = await resolveRolesForUser(userId);
  if (!roles.includes("seller")) {
    throw new ForbiddenError("Seller role required");
  }
  return { userId, roles };
}
