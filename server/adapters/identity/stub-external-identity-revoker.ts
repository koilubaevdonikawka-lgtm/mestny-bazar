import type { IExternalIdentityRevoker } from "@server/ports/external-identity-revoker.port";

/**
 * No external provider requires revocation yet (sign-in is Google and Telegram
 * only). Replace with an Apple adapter (POST https://appleid.apple.com/auth/revoke)
 * when Sign in with Apple is added — same fallback pattern as StubPushNotifier.
 */
export class StubExternalIdentityRevoker implements IExternalIdentityRevoker {
  async revokeForUser(): Promise<void> {}
}
