/**
 * The database part of the deletion already committed (orders detached and
 * anonymized, addresses/cart/device tokens deleted, profile cleared), but the auth
 * user could not be removed. The account is left as a valid, empty customer
 * account; repeating the request is safe — the erase is idempotent and the auth
 * deletion is retried.
 */
export class AccountDeletionIncompleteError extends Error {
  constructor(message = "Account data was erased but the sign-in account could not be removed") {
    super(message);
    this.name = "AccountDeletionIncompleteError";
  }
}
