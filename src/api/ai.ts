import type { AIWorkersStatusDTO } from "@shared/contracts/ai";
import { getAIWorkersStatusFn } from "@/api/ai.functions";

export async function getAIWorkersStatus(): Promise<AIWorkersStatusDTO> {
  return getAIWorkersStatusFn();
}
