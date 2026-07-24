import type { AIRequest, AITask } from "@server/platform/ai/ai/models";
import { createAIExecutionPlan } from "@server/platform/ai/ai/models/ai-execution-plan.model";
import type { AIExecutionPlan } from "@server/platform/ai/ai/models";
import type { AIWorkerRegistry } from "@server/platform/ai/ai/registry";
import {
  resolveAggregationKeys,
  resolveWorkerPlan,
} from "@server/platform/ai/ai/planner/ai-task-types";

/** Builds sequential worker execution plans for AI tasks. */
export class AIExecutionPlanner {
  constructor(private readonly registry: AIWorkerRegistry) {}

  plan(task: AITask, request?: AIRequest): AIExecutionPlan {
    const explicitWorkerIds = request?.workerIds?.map((id) => id.trim()).filter(Boolean) ?? [];
    const plannedWorkerIds =
      explicitWorkerIds.length > 0 ? explicitWorkerIds : this.resolveWorkersForTask(task.type);

    const registeredWorkerIds = plannedWorkerIds.filter((workerId) =>
      Boolean(this.registry.getWorker(workerId)),
    );

    return createAIExecutionPlan({
      taskId: task.id,
      workerIds: registeredWorkerIds,
      aggregationKeys: resolveAggregationKeys(task.type, registeredWorkerIds),
    });
  }

  private resolveWorkersForTask(taskType: string): readonly string[] {
    const planned = resolveWorkerPlan(taskType);
    if (planned.length > 0) {
      return planned;
    }

    return this.registry
      .getWorkers()
      .filter((worker) => worker.canHandle(taskType))
      .map((worker) => worker.id);
  }
}
