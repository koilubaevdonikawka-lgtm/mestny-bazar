/** Unique identifier for a background job. */
export class JobId {
  private constructor(private readonly value: string) {}

  static create(raw: string): JobId {
    const value = raw?.trim();
    if (!value) {
      throw new Error("JobId requires a non-empty value.");
    }
    return Object.freeze(new JobId(value));
  }

  static generate(): JobId {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return JobId.create(`job-${suffix}`);
  }

  toString(): string {
    return this.value;
  }

  equals(other: JobId): boolean {
    return this.value === other.value;
  }

  toJSON(): { value: string } {
    return Object.freeze({ value: this.value });
  }
}
