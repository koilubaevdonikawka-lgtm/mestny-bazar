export interface AIWorkerSummary {
  id: string;
}

/** ai.md — worker status only; analysis results are not persisted (documented, known limitation). */
export interface AIWorkersStatusDTO {
  workers: AIWorkerSummary[];
  triggerEvent: string;
  resultsPersisted: boolean;
}
