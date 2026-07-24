import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import type { IAIWorker } from "@server/platform/ai/ai/contracts/ai-worker.contract";
import { createAIWorkerResult, type AITask } from "@server/platform/ai/ai/models";

export abstract class BaseAIWorker implements IAIWorker {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly taskTypes: readonly string[];

  constructor(protected readonly provider: IAIProvider) {}

  canHandle(taskType: string): boolean {
    const normalized = taskType.trim();
    return this.taskTypes.includes(normalized) || normalized.startsWith(this.taskTypes[0]?.split(".")[0] ?? "");
  }

  protected async generate(
    task: AITask,
    prompt: string,
    outputKey: string,
  ): Promise<ReturnType<typeof createAIWorkerResult>> {
    const content = await this.provider.complete(prompt, {
      metadata: {
        workerId: this.id,
        taskId: task.id,
        taskType: task.type,
      },
    });

    return createAIWorkerResult({
      taskId: task.id,
      workerId: this.id,
      output: {
        [outputKey]: content,
        providerId: this.provider.providerId,
      },
    });
  }

  abstract execute(task: AITask): Promise<ReturnType<typeof createAIWorkerResult>>;
}

function readString(payload: Readonly<Record<string, unknown>>, key: string, fallback = ""): string {
  const value = payload[key];
  return typeof value === "string" ? value : fallback;
}

export function readTaskString(task: AITask, key: string, fallback = ""): string {
  return readString(task.payload, key, fallback);
}

export function readTaskNumber(task: AITask, key: string, fallback = 0): number {
  const value = task.payload[key];
  return typeof value === "number" ? value : fallback;
}
