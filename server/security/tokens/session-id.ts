/** Opaque session identifier — domain model, not a JWT. */
export class SessionId {
  private constructor(private readonly value: string) {}

  static create(raw: string): SessionId {
    const value = raw?.trim();
    if (!value) {
      throw new Error("SessionId requires a non-empty value.");
    }
    return Object.freeze(new SessionId(value));
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionId): boolean {
    return this.value === other.value;
  }

  toJSON(): { value: string } {
    return Object.freeze({ value: this.value });
  }
}
