export type DigitalTwinKind =
  | "platform"
  | "component"
  | "provider"
  | "sdk"
  | "gateway";

/** Registered digital twin metadata. */
export interface DigitalTwin {
  readonly id: string;
  readonly name: string;
  readonly kind: DigitalTwinKind;
  readonly sourceId: string;
  readonly description: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly registeredAt: string;
}

export function createDigitalTwin(input: {
  id?: string;
  name: string;
  kind: DigitalTwinKind;
  sourceId: string;
  description?: string;
  metadata?: Readonly<Record<string, unknown>>;
}): DigitalTwin {
  return Object.freeze({
    id: input.id ?? `twin-${Date.now()}`,
    name: input.name.trim(),
    kind: input.kind,
    sourceId: input.sourceId.trim(),
    description: input.description?.trim() ?? "",
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    registeredAt: new Date().toISOString(),
  });
}
