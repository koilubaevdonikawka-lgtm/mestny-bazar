/** API version descriptor for gateway routing. */
export interface ApiVersionDescriptor {
  readonly label: string;
  readonly major: number;
  readonly minor: number;
  readonly deprecated: boolean;
}

export function createApiVersionDescriptor(input: {
  major: number;
  minor: number;
  deprecated?: boolean;
}): ApiVersionDescriptor {
  return Object.freeze({
    label: `v${input.major}.${input.minor}`,
    major: input.major,
    minor: input.minor,
    deprecated: input.deprecated ?? false,
  });
}
