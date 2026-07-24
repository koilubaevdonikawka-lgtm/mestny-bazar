/** Semantic SDK version descriptor. */
export interface SDKVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly label: string;
}

export function createSDKVersion(input: {
  major: number;
  minor: number;
  patch: number;
}): SDKVersion {
  return Object.freeze({
    major: input.major,
    minor: input.minor,
    patch: input.patch,
    label: `${input.major}.${input.minor}.${input.patch}`,
  });
}

export function parseSDKVersion(value: string): SDKVersion {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid SDK version: ${value}`);
  }
  return createSDKVersion({
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  });
}
