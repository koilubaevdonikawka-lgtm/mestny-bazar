import type { IAIResultAggregator, IAIWorker } from "@server/platform/ai/ai/contracts";
import {
  createAITaskCompletedEvent,
  createAITaskStartedEvent,
  createAIWorkerCompletedEvent,
} from "@server/platform/ai/ai/events";
import {
  createAITask,
  createAIRequest,
  type AIRequest,
  type AIResponse,
  type AITask,
} from "@server/platform/ai/ai/models";
import type { AIWorkerResult } from "@server/platform/ai/ai/models/ai-worker-result.model";
import type { AIExecutionPlanner } from "@server/platform/ai/ai/planner";
import type { AIWorkerRegistry } from "@server/platform/ai/ai/registry";
import type { IIdGenerator } from "@server/application/ports";

/** Single entry point for platform AI execution. */
export class AIOrchestrator {
  constructor(
    private readonly planner: AIExecutionPlanner,
    private readonly registry: AIWorkerRegistry,
    private readonly aggregator: IAIResultAggregator,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(request: AIRequest): Promise<AIResponse> {
    const normalized = createAIRequest(request);
    const task = createAITask({
      id: this.idGenerator.generate(),
      type: normalized.taskType,
      payload: {
        ...normalized.payload,
        requestedBy: normalized.requestedBy,
      },
    });

    const plan = this.planner.plan(task, normalized);
    createAITaskStartedEvent(task, plan.workerIds);

    const workerResults: AIWorkerResult[] = [];
    for (const workerId of plan.workerIds) {
      const result = await this.executeWorker(task, workerId);
      workerResults.push(result);
    }

    const response = this.aggregator.aggregate(task, workerResults);
    createAITaskCompletedEvent(response);
    return response;
  }

  async executeWorker(task: AITask, workerId: string): Promise<AIWorkerResult> {
    const worker = this.requireWorker(workerId);
    const result = await worker.execute(task);
    createAIWorkerCompletedEvent(result);
    return result;
  }

  registerWorker(worker: IAIWorker): void {
    this.registry.register(worker);
  }

  getAvailableWorkers(): readonly string[] {
    return this.registry.getAvailableWorkers();
  }

  private requireWorker(workerId: string): IAIWorker {
    const worker = this.registry.getWorker(workerId);
    if (!worker) {
      throw new Error(`AI worker not found: ${workerId}`);
    }
    return worker;
  }
}
