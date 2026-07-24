import type {
  TestCustomer,
  TestFixtureBundle,
  TestMarketplaceListing,
  TestOrder,
  TestPayment,
  TestProduct,
  TestSeller,
} from "@server/platform/testing/testing/models";
import type { ITestFixture } from "@server/platform/testing/testing/contracts";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { CustomerModule } from "@server/application/modules/customer/customer/api/customer.module";
import type { SellerModule } from "@server/application/modules/seller/seller/api/seller.module";
import type { ProductModule } from "@server/application/modules/product/product/api/product.module";
import type { MarketplaceModule } from "@server/application/modules/marketplace/marketplace/api/marketplace.module";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

let sequence = 0;

function nextSuffix(): string {
  sequence += 1;
  return `${Date.now()}-${sequence}`;
}

/** Generates reusable test fixtures and seeds them through Module APIs. */
export class FixtureFactory implements ITestFixture {
  createCustomer(overrides: Partial<TestCustomer> = {}): TestCustomer {
    const suffix = nextSuffix();
    return Object.freeze({
      displayName: overrides.displayName ?? `Test Customer ${suffix}`,
      phone: overrides.phone ?? `+996700${String(sequence).padStart(6, "0")}`,
      email: overrides.email ?? `customer-${suffix}@test.local`,
      id: overrides.id,
    });
  }

  createSeller(overrides: Partial<TestSeller> = {}): TestSeller {
    const suffix = nextSuffix();
    return Object.freeze({
      displayName: overrides.displayName ?? `Test Seller ${suffix}`,
      email: overrides.email ?? `seller-${suffix}@test.local`,
      phone: overrides.phone ?? `+996701${String(sequence).padStart(6, "0")}`,
      storeName: overrides.storeName ?? `Store ${suffix}`,
      id: overrides.id,
    });
  }

  createProduct(sellerId: string, overrides: Partial<TestProduct> = {}): TestProduct {
    const suffix = nextSuffix();
    return Object.freeze({
      sellerId,
      name: overrides.name ?? `Test Product ${suffix}`,
      priceAmount: overrides.priceAmount ?? 1500,
      priceCurrency: overrides.priceCurrency ?? "KGS",
      stockQuantity: overrides.stockQuantity ?? 25,
      id: overrides.id,
    });
  }

  createOrder(customerId: string, overrides: Partial<TestOrder> = {}): TestOrder {
    return Object.freeze({
      customerId,
      amount: overrides.amount ?? 1500,
      currency: overrides.currency ?? "KGS",
      id: overrides.id,
    });
  }

  createPayment(orderId: string, overrides: Partial<TestPayment> = {}): TestPayment {
    return Object.freeze({
      orderId,
      amount: overrides.amount ?? 1500,
      currency: overrides.currency ?? "KGS",
      method: overrides.method ?? "finik",
      id: overrides.id,
    });
  }

  createMarketplaceListing(
    productId: string,
    sellerId: string,
    overrides: Partial<TestMarketplaceListing> = {},
  ): TestMarketplaceListing {
    return Object.freeze({
      productId,
      sellerId,
      published: overrides.published ?? false,
    });
  }

  createBundle(overrides: Partial<TestFixtureBundle> = {}): TestFixtureBundle {
    const seller = overrides.seller ?? this.createSeller();
    const customer = overrides.customer ?? this.createCustomer();
    const product =
      overrides.product ?? this.createProduct(seller.id ?? "pending-seller-id");
    const order = overrides.order ?? this.createOrder(customer.id ?? "pending-customer-id");
    const payment = overrides.payment ?? this.createPayment(order.id ?? "pending-order-id");
    const listing =
      overrides.listing ??
      this.createMarketplaceListing(product.id ?? "pending-product-id", seller.id ?? "pending-seller-id");

    return Object.freeze({
      customer,
      seller,
      product,
      order,
      payment,
      listing,
    });
  }

  async seed(context: TestExecutionContext, bundle: TestFixtureBundle): Promise<TestFixtureBundle> {
    const customerModule = context.resolveModule<CustomerModule>(BootstrapTokens.CustomerModule);
    const sellerModule = context.resolveModule<SellerModule>(BootstrapTokens.SellerModule);
    const productModule = context.resolveModule<ProductModule>(BootstrapTokens.ProductModule);
    const marketplaceModule = context.resolveModule<MarketplaceModule>(
      BootstrapTokens.MarketplaceModule,
    );

    const customer = await customerModule.createCustomer({
      displayName: bundle.customer.displayName,
      phone: bundle.customer.phone,
      email: bundle.customer.email,
    });

    const seller = await sellerModule.createSeller({
      displayName: bundle.seller.displayName,
      email: bundle.seller.email,
      phone: bundle.seller.phone,
      storeName: bundle.seller.storeName,
    });
    await sellerModule.approveSeller({ sellerId: seller.id });

    const product = await productModule.createProduct({
      sellerId: seller.id,
      name: bundle.product.name,
      priceAmount: bundle.product.priceAmount,
      priceCurrency: bundle.product.priceCurrency,
      stockQuantity: bundle.product.stockQuantity,
    });
    await productModule.publishProduct({ productId: product.id, sellerId: seller.id });
    await marketplaceModule.approveListing({ productId: product.id });

    return Object.freeze({
      ...bundle,
      customer: Object.freeze({ ...bundle.customer, id: customer.id }),
      seller: Object.freeze({ ...bundle.seller, id: seller.id }),
      product: Object.freeze({ ...bundle.product, id: product.id, sellerId: seller.id }),
      listing: Object.freeze({
        productId: product.id,
        sellerId: seller.id,
        published: true,
      }),
    });
  }
}
