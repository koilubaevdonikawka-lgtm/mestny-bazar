import type { RuntimeProfile } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

export interface IRuntimeProfileSerializer {
  serialize(runtimeProfile: RuntimeProfile): Promise<string>;
  deserialize(serialized: string): Promise<RuntimeProfile>;
}
