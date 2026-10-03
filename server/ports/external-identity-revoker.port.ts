/**
 * Revokes a deleted user's grants at external identity providers that require it.
 * Extension point for Sign in with Apple: Apple requires an account deletion to
 * revoke the user's tokens via its REST API (POST https://appleid.apple.com/auth/revoke).
 * Called after the database erase and before the auth user is deleted, while the
 * auth identities (and their provider ids) still exist. No provider needs it
 * today, so the container wires a stub.
 */
export interface IExternalIdentityRevoker {
  revokeForUser(userId: string): Promise<void>;
}
