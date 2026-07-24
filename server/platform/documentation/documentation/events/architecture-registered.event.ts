export const ArchitectureRegisteredEventName = "platform.documentation.architecture.registered";

export interface ArchitectureRegisteredEvent {
  readonly name: typeof ArchitectureRegisteredEventName;
  readonly occurredAt: string;
  readonly nodeId: string;
  readonly nodeKind: string;
}

export function createArchitectureRegisteredEvent(input: {
  nodeId: string;
  nodeKind: string;
}): ArchitectureRegisteredEvent {
  return Object.freeze({
    name: ArchitectureRegisteredEventName,
    occurredAt: new Date().toISOString(),
    nodeId: input.nodeId.trim(),
    nodeKind: input.nodeKind.trim(),
  });
}
