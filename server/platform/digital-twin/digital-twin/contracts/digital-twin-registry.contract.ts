import type {
  DigitalTwin,
  DigitalTwinKind,
} from "@server/platform/digital-twin/digital-twin/models";

/** Contract for digital twin registry. */
export interface IDigitalTwinRegistry {
  register(twin: DigitalTwin): DigitalTwin;
  get(twinId: string): DigitalTwin | undefined;
  list(kind?: DigitalTwinKind): readonly DigitalTwin[];
}
