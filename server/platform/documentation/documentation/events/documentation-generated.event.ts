export const DocumentationGeneratedEventName = "platform.documentation.generated";

export interface DocumentationGeneratedEvent {
  readonly name: typeof DocumentationGeneratedEventName;
  readonly occurredAt: string;
  readonly moduleCount: number;
  readonly platformCount: number;
}

export function createDocumentationGeneratedEvent(input: {
  moduleCount: number;
  platformCount: number;
}): DocumentationGeneratedEvent {
  return Object.freeze({
    name: DocumentationGeneratedEventName,
    occurredAt: new Date().toISOString(),
    moduleCount: input.moduleCount,
    platformCount: input.platformCount,
  });
}
