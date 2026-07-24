import type { KnowledgeResult } from "@server/platform/knowledge/knowledge/models";

export interface KnowledgeQueryExecutedEvent {
  readonly type: "knowledge.query.executed";
  readonly result: KnowledgeResult;
}

export function createKnowledgeQueryExecutedEvent(
  result: KnowledgeResult,
): KnowledgeQueryExecutedEvent {
  return Object.freeze({ type: "knowledge.query.executed", result });
}
