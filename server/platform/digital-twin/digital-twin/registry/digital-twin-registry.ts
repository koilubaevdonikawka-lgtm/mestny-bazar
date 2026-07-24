import type { IDigitalTwinRegistry } from "@server/platform/digital-twin/digital-twin/contracts";
import {
  createDigitalTwin,
  type DigitalTwin,
  type DigitalTwinKind,
} from "@server/platform/digital-twin/digital-twin/models";

/** Central registry for platform digital twins. */
export class DigitalTwinRegistry implements IDigitalTwinRegistry {
  private readonly twins = new Map<string, DigitalTwin>();

  register(twin: DigitalTwin): DigitalTwin {
    const stored = createDigitalTwin(twin);
    this.twins.set(stored.id, stored);
    return stored;
  }

  get(twinId: string): DigitalTwin | undefined {
    return this.twins.get(twinId.trim());
  }

  list(kind?: DigitalTwinKind): readonly DigitalTwin[] {
    const values = [...this.twins.values()];
    const filtered = kind ? values.filter((twin) => twin.kind === kind) : values;
    return Object.freeze([...filtered]);
  }
}
