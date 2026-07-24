/** 64-bit span identifier compatible with W3C trace context conventions. */
export class SpanId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(raw: string): SpanId {
    const value = raw?.trim().toLowerCase();
    if (!value || !/^[0-9a-f]{16}$/.test(value)) {
      throw new Error("SpanId must be a 16-character lowercase hex string.");
    }
    return new SpanId(value);
  }

  static generate(): SpanId {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return SpanId.create([...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join(""));
  }

  toString(): string {
    return this.value;
  }

  equals(other: SpanId): boolean {
    return this.value === other.value;
  }
}
