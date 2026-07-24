/** Generated test customer fixture. */
export interface TestCustomer {
  readonly id?: string;
  readonly displayName: string;
  readonly phone: string;
  readonly email?: string | null;
}

/** Generated test seller fixture. */
export interface TestSeller {
  readonly id?: string;
  readonly displayName: string;
  readonly email: string;
  readonly phone: string;
  readonly storeName: string;
}

/** Generated test product fixture. */
export interface TestProduct {
  readonly id?: string;
  readonly sellerId: string;
  readonly name: string;
  readonly priceAmount: number;
  readonly priceCurrency: string;
  readonly stockQuantity: number;
}

/** Generated test order fixture. */
export interface TestOrder {
  readonly id?: string;
  readonly customerId: string;
  readonly amount: number;
  readonly currency: string;
}

/** Generated test payment fixture. */
export interface TestPayment {
  readonly id?: string;
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly method: string;
}

/** Generated marketplace listing fixture. */
export interface TestMarketplaceListing {
  readonly productId: string;
  readonly sellerId: string;
  readonly published?: boolean;
}

/** Bundle of loaded test fixtures. */
export interface TestFixtureBundle {
  readonly customer: TestCustomer;
  readonly seller: TestSeller;
  readonly product: TestProduct;
  readonly order?: TestOrder;
  readonly payment?: TestPayment;
  readonly listing?: TestMarketplaceListing;
}
