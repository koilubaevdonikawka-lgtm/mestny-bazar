import { createServerFn } from "@tanstack/react-start";
import type { AIWorkersStatusDTO } from "@shared/contracts/ai";

export const getAIWorkersStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AIWorkersStatusDTO> => {
    const { executeGetAIWorkersStatus } = await import("@server/functions/ai.executor");
    return executeGetAIWorkersStatus();
  },
);
