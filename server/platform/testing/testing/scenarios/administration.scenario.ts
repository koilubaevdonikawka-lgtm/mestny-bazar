import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { AdministrationModule } from "@server/application/modules/administration/administration/api/administration.module";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const AdministrationScenarioId = "administration";

/** Administration configuration read scenario. */
export class AdministrationScenario implements ITestScenario {
  readonly id = AdministrationScenarioId;
  readonly name = "Administration Configuration Flow";
  readonly category = "administration";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions } = context;
    const administrationModule = context.resolveModule<AdministrationModule>(
      BootstrapTokens.AdministrationModule,
    );

    const settings = await administrationModule.getSystemSettings();
    const configuration = await administrationModule.getMarketplaceConfiguration();

    assertions.assertSuccess(settings, "System settings must be available");
    assertions.assertSuccess(configuration, "Marketplace configuration must be available");
    assertions.assertSuccess(settings.platformName, "System settings must include platform name");
  }
}
