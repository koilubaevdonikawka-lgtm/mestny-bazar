import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { ModerationModule } from "@server/application/modules/moderation/moderation/api/moderation.module";
import { ModerationTarget } from "@server/application/modules/moderation/moderation/models/moderation-target.model";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const ModerationScenarioId = "moderation";

/** Moderation request lifecycle scenario. */
export class ModerationScenario implements ITestScenario {
  readonly id = ModerationScenarioId;
  readonly name = "Moderation Flow";
  readonly category = "moderation";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;
    assertions.assertSuccess(fixtures.product.id, "Product fixture must be seeded");

    const moderationModule = context.resolveModule<ModerationModule>(
      BootstrapTokens.ModerationModule,
    );

    const request = await moderationModule.requestModeration({
      target: ModerationTarget.Product,
      targetId: fixtures.product.id!,
      requestedBy: fixtures.seller.id ?? null,
    });
    assertions.assertSuccess(request.id, "Moderation request must be created");

    const approved = await moderationModule.approve({
      requestId: request.id,
    });
    assertions.assertSuccess(approved.id, "Moderation request must be approved");

    const status = await moderationModule.getStatus({
      target: ModerationTarget.Product,
      targetId: fixtures.product.id!,
    });
    assertions.assertStatus(status, "approved");
  }
}
