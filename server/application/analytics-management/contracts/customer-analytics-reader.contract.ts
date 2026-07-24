/** Raw customer record for analytics aggregation. */
export interface CustomerAnalyticsRecord {
  readonly customerId: string;
  readonly orderCount: number;
  readonly totalSpent: number;
  readonly currency: string | null;
  readonly lastOrderAt: string | null;
}

export interface CustomerAnalyticsSnapshot {
  readonly totalCustomers: number;
  readonly activeCustomers: number;
  readonly averageOrdersPerCustomer: number;
  readonly records: readonly CustomerAnalyticsRecord[];
}

/** Read-only customer analytics access. */
export interface ICustomerAnalyticsReader {
  getCustomerSnapshot(): Promise<CustomerAnalyticsSnapshot>;
}
