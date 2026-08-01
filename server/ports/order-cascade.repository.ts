export interface IOrderCascadeRepository {
  /**
   * Atomically claims the operational-cascade trigger for this order.
   * Returns true only for the caller that actually claimed it — safe to call
   * redundantly (e.g. once per staff page view); every caller after the
   * first gets false and must not re-publish the cascade event.
   */
  claim(orderId: string): Promise<boolean>;
}
