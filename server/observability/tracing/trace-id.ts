/** 128-bit trace identifier compatible with W3C trace context conventions. */
export class TraceId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(raw: string): TraceId {
    const value = raw?.trim().toLowerCase();
    if (!value || !/^[0-9a-f]{32}$/.test(value)) {
      throw new Error("TraceId must be a 32-character lowercase hex string.");
    }
    return new TraceId(value);
  }

  static generate(): TraceId {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return TraceId.create([...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join(""));
  }

  toString(): string {
    return this.value;
  }

  equals(other: TraceId): boolean {
    return this.value === other.value;
  }
}
