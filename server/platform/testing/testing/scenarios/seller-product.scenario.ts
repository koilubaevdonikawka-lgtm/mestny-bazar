import { BootstrapTokens } from "@server/bootstrap/tokens";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { CatalogModule } from "@server/application/modules/catalog/catalog/api/catalog.module";
import { ProductStatus } from "@server/application/modules/product/product/models";
import type { SellerModule } from "@server/application/modules/seller/seller/api/seller.module";
import type { SellerProductApplicationService } from "@server/application/seller-product/services/seller-product-application.service";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const SellerProductScenarioId = "seller-product";

/** Validates full seller product lifecycle from draft through archive. */
export class SellerProductScenario implements ITestScenario {
  readonly id = SellerProductScenarioId;
  readonly name = "Seller Product Management";
  readonly category = "seller-product";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions } = context;

    const sellers = context.resolveModule<SellerModule>(BootstrapTokens.SellerModule);
    const catalog = context.resolveModule<CatalogModule>(BootstrapTokens.CatalogModule);
    const sellerProducts = context.resolveModule<SellerProductApplicationService>(
      InfrastructureTokens.SellerProductApplicationService,
    );

    const seller = await sellers.createSeller({
      displayName: "Seller Product Test",
      email: `seller-product-${Date.now()}@test.local`,
      phone: "+996703000001",
      storeName: "Seller Product Store",
    });
    await sellers.approveSeller({ sellerId: seller.id });

    const category = await catalog.createCategory({
      catalogId: "catalog-default",
      name: `Category ${Date.now()}`,
      slug: `category-${Date.now()}`,
    });
    await catalog.publishCategory({ categoryId: category.id });

    let product = (
      await sellerProducts.createProduct({
        sellerId: seller.id,
        name: "Seller Managed Product",
        description: "Full lifecycle test product",
        priceAmount: 2500,
        priceCurrency: "KGS",
        stockQuantity: 10,
        attributes: { categoryId: category.id },
      })
    ).value;
    assertions.assertSuccess(product.status === ProductStatus.Draft, "New product must be Draft");

    product = (
      await sellerProducts.uploadImages({
        productId: product.id,
        sellerId: seller.id,
        media: [{ url: "https://example.com/product.jpg", sortOrder: 0 }],
      })
    ).value;
    assertions.assertSuccess(product.media.length === 1, "Product must have uploaded image");

    product = (
      await sellerProducts.updateProduct({
        productId: product.id,
        sellerId: seller.id,
        name: "Seller Managed Product Updated",
        description: "Updated description",
      })
    ).value;
    assertions.assertSuccess(
      product.name === "Seller Managed Product Updated",
      "Product name must be updated",
    );

    product = (
      await sellerProducts.changePrice({
        productId: product.id,
        sellerId: seller.id,
        amount: 3000,
        currency: "KGS",
      })
    ).value;
    assertions.assertSuccess(product.price.amount === 3000, "Product price must be updated");

    product = (
      await sellerProducts.changeInventory({
        productId: product.id,
        sellerId: seller.id,
        quantity: 15,
      })
    ).value;
    assertions.assertSuccess(product.stock.quantity === 15, "Product stock must be updated");

    product = (
      await sellerProducts.submitForModeration({
        productId: product.id,
        sellerId: seller.id,
      })
    ).value;
    assertions.assertSuccess(
      product.status === ProductStatus.PendingReview,
      "Product must be PendingReview after submit",
    );

    product = (await sellerProducts.approveProduct(product.id)).value;
    assertions.assertSuccess(
      product.status === ProductStatus.ReadyForPublication,
      "Product must be ReadyForPublication after approval",
    );

    product = (
      await sellerProducts.publishProduct({
        productId: product.id,
        sellerId: seller.id,
      })
    ).value;
    assertions.assertSuccess(
      product.status === ProductStatus.Published,
      "Product must be Published after publish",
    );

    product = (
      await sellerProducts.changePrice({
        productId: product.id,
        sellerId: seller.id,
        amount: 3200,
        currency: "KGS",
      })
    ).value;
    assertions.assertSuccess(product.price.amount === 3200, "Published product price must change");

    product = (
      await sellerProducts.unpublishProduct({
        productId: product.id,
        sellerId: seller.id,
      })
    ).value;
    assertions.assertSuccess(product.status === ProductStatus.Hidden, "Product must be Hidden after unpublish");

    product = (
      await sellerProducts.archiveProduct({
        productId: product.id,
        sellerId: seller.id,
      })
    ).value;
    assertions.assertSuccess(
      product.status === ProductStatus.Archived,
      "Product must be Archived after archive",
    );

    const rejectedDraft = await sellers.createSeller({
      displayName: "Reject Flow Seller",
      email: `reject-flow-${Date.now()}@test.local`,
      phone: "+996703000002",
      storeName: "Reject Store",
    });
    await sellers.approveSeller({ sellerId: rejectedDraft.id });

    let rejectProduct = (
      await sellerProducts.createProduct({
        sellerId: rejectedDraft.id,
        name: "Reject Test Product",
        priceAmount: 1000,
        priceCurrency: "KGS",
        stockQuantity: 5,
        attributes: { categoryId: category.id },
        media: [{ url: "https://example.com/reject.jpg" }],
      })
    ).value;
    rejectProduct = (
      await sellerProducts.submitForModeration({
        productId: rejectProduct.id,
        sellerId: rejectedDraft.id,
      })
    ).value;
    rejectProduct = (
      await sellerProducts.rejectProduct({
        productId: rejectProduct.id,
        reason: "Incomplete product information",
      })
    ).value;
    assertions.assertSuccess(
      rejectProduct.status === ProductStatus.Draft,
      "Rejected product must return to Draft",
    );

    const list = (await sellerProducts.getSellerProducts(seller.id)).value;
    assertions.assertSuccess(list.some((item) => item.id === product.id), "Seller product list must include product");
  }
}
