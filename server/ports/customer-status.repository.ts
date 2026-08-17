/** Narrow, checkout-facing read of a customer's blocked status — backed by the same
 * `profiles` table as IUserAdminRepository, but kept as its own minimal port so
 * CheckoutService/PaymentPolicyService don't depend on an "admin" abstraction. */
export interface ICustomerStatusRepository {
  isBlocked(userId: string): Promise<boolean>;
}
