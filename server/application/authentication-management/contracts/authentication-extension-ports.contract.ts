/**
 * Future integration ports for Authentication Management.
 * Not implemented — reserved for external identity systems.
 */

import type { AuthenticationIdentity } from "@server/application/authentication-management/contracts/authentication-provider.contract";
import type { LoginInput, LoginResult } from "@server/application/authentication-management/models/authentication.model";

/** JWT Token Provider — JSON Web Token issuance and validation. */
export interface IJwtTokenProvider {
  issueJwt(userId: string, claims: Readonly<Record<string, string>>): Promise<string>;
  validateJwt(token: string): Promise<{ userId: string; claims: Readonly<Record<string, string>> } | null>;
}

/** OAuth Provider — third-party OAuth authentication. */
export interface IOAuthProvider {
  getAuthorizationUrl(provider: string, redirectUri: string): Promise<string>;
  exchangeCode(provider: string, code: string): Promise<AuthenticationIdentity>;
}

/** Keycloak Provider — Keycloak identity broker integration. */
export interface IKeycloakProvider {
  authenticateWithKeycloak(accessToken: string): Promise<AuthenticationIdentity>;
  refreshKeycloakToken(refreshToken: string): Promise<LoginResult>;
}

/** LDAP Provider — directory-based authentication. */
export interface ILdapProvider {
  bind(username: string, password: string): Promise<AuthenticationIdentity>;
  searchUser(username: string): Promise<AuthenticationIdentity | null>;
}

/** MFA Provider — multi-factor authentication. */
export interface IMfaProvider {
  initiateChallenge(userId: string): Promise<{ challengeId: string; method: string }>;
  verifyChallenge(challengeId: string, code: string): Promise<boolean>;
}

/** SSO Provider — single sign-on federation. */
export interface ISsoProvider {
  initiateSsoLogin(organizationId: string): Promise<string>;
  completeSsoLogin(token: string): Promise<AuthenticationIdentity>;
}

/** Session Cache — distributed session storage. */
export interface ISessionCache {
  get(sessionId: string): Promise<unknown | null>;
  set(sessionId: string, value: unknown, ttlSeconds: number): Promise<void>;
  delete(sessionId: string): Promise<void>;
}
