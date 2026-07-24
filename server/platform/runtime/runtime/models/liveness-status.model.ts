export interface LivenessStatus {
  readonly alive: boolean;
  readonly timestamp: string;
  readonly uptimeSeconds: number;
  readonly pid: number;
}

export function createLivenessStatus(input: {
  uptimeSeconds: number;
  pid?: number;
}): LivenessStatus {
  return Object.freeze({
    alive: true,
    timestamp: new Date().toISOString(),
    uptimeSeconds: input.uptimeSeconds,
    pid: input.pid ?? (typeof process !== "undefined" ? process.pid : 0),
  });
}
