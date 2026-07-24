import type { ILivenessService } from "@server/platform/runtime/runtime/contracts";
import { createLivenessStatus, type LivenessStatus } from "@server/platform/runtime/runtime/models";

/** Verifies that the application process is alive. */
export class LivenessService implements ILivenessService {
  private readonly startedAt = Date.now();

  check(): LivenessStatus {
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt) / 1000);
    return createLivenessStatus({ uptimeSeconds });
  }
}
