import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { SupportModule } from "@server/application/modules/support/support/api/support.module";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const SupportScenarioId = "support";

/** Support ticket lifecycle scenario. */
export class SupportScenario implements ITestScenario {
  readonly id = SupportScenarioId;
  readonly name = "Support Ticket Flow";
  readonly category = "support";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;
    assertions.assertSuccess(fixtures.customer.id, "Customer fixture must be seeded");

    const supportModule = context.resolveModule<SupportModule>(BootstrapTokens.SupportModule);

    const ticket = await supportModule.createTicket({
      subject: "Test support ticket",
      requesterId: fixtures.customer.id!,
      message: "Testing support workflow via Module API",
      relatedEntityType: "product",
      relatedEntityId: fixtures.product.id ?? null,
    });
    assertions.assertSuccess(ticket.id, "Support ticket must be created");

    const stored = await supportModule.getTicket(ticket.id);
    assertions.assertSuccess(stored, "Support ticket must be retrievable");
    assertions.assertEquals(stored!.requesterId, fixtures.customer.id!);
  }
}
