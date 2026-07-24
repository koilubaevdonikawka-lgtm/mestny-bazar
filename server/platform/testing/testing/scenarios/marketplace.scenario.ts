import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { MarketplaceModule } from "@server/application/modules/marketplace/marketplace/api/marketplace.module";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const MarketplaceScenarioId = "marketplace";

/** Marketplace listing lifecycle scenario. */
export class MarketplaceScenario implements ITestScenario {
  readonly id = MarketplaceScenarioId;
  readonly name = "Marketplace Listing Flow";
  readonly category = "marketplace";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;
    assertions.assertSuccess(fixtures.product.id, "Product fixture must be seeded");
    assertions.assertSuccess(fixtures.seller.id, "Seller fixture must be seeded");

    const marketplaceModule = context.resolveModule<MarketplaceModule>(
      BootstrapTokens.MarketplaceModule,
    );

    const listing = await marketplaceModule.getListing(fixtures.product.id!);
    assertions.assertSuccess(listing, "Listing must exist after fixture seeding");

    const published = await marketplaceModule.isPublished(fixtures.product.id!);
    assertions.assertSuccess(published, "Listing must be published");
    assertions.assertEquals(listing!.sellerId, fixtures.seller.id!);
  }
}
