/** Persists pending phone verification codes — swappable with Redis, DB, or external service. */
export interface IPhoneVerificationRepository {
  saveCode(customerId: string, code: string): Promise<void>;
  verify(customerId: string, code: string): Promise<boolean>;
  delete(customerId: string): Promise<void>;
}
