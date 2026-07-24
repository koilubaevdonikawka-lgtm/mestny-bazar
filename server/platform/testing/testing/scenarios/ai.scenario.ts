import { BootstrapTokens } from "@server/bootstrap/tokens";
import { AITaskType } from "@server/platform/ai/ai/planner/ai-task-types";
import type { AIOrchestrator } from "@server/platform/ai/ai/orchestrator";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";
import {
  createScenarioFinishedEvent,
  createScenarioStartedEvent,
} from "@server/platform/testing/testing/events";

export const AIScenarioId = "ai";

/** AI orchestrator execution scenario. */
export class AIScenario implements ITestScenario {
  readonly id = AIScenarioId;
  readonly name = "AI Orchestrator Flow";
  readonly category = "ai";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;
    const orchestrator = context.resolveModule<AIOrchestrator>(BootstrapTokens.AIOrchestrator);

    createScenarioStartedEvent({ scenarioId: this.id, scenarioName: this.name });

    const response = await orchestrator.execute({
      taskType: AITaskType.ProductDescription,
      payload: Object.freeze({
        productName: fixtures.product.name,
        productId: fixtures.product.id ?? "test-product",
      }),
      requestedBy: "testing-platform",
    });

    assertions.assertSuccess(response.taskId, "AI response must include task id");
    assertions.assertSuccess(response.output, "AI response must include output");
    createScenarioFinishedEvent({
      scenarioId: this.id,
      durationMs: 0,
      status: "passed",
    });
  }
}
