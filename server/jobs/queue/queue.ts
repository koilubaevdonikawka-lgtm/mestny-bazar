/** Named job queue descriptor — broker-agnostic. */
export class Queue {
  readonly name: string;
  readonly description?: string;
  readonly maxConcurrency?: number;
  readonly defaultMaxAttempts?: number;
  readonly visibilityTimeoutMs?: number;

  private constructor(props: {
    name: string;
    description?: string;
    maxConcurrency?: number;
    defaultMaxAttempts?: number;
    visibilityTimeoutMs?: number;
  }) {
    this.name = props.name;
    this.description = props.description;
    this.maxConcurrency = props.maxConcurrency;
    this.defaultMaxAttempts = props.defaultMaxAttempts;
    this.visibilityTimeoutMs = props.visibilityTimeoutMs;
    Object.freeze(this);
  }

  static create(
    name: string,
    options?: {
      description?: string;
      maxConcurrency?: number;
      defaultMaxAttempts?: number;
      visibilityTimeoutMs?: number;
    },
  ): Queue {
    const queueName = name?.trim();
    if (!queueName) {
      throw new Error("Queue requires a non-empty name.");
    }

    return new Queue({
      name: queueName,
      description: options?.description?.trim() || undefined,
      maxConcurrency: options?.maxConcurrency,
      defaultMaxAttempts: options?.defaultMaxAttempts,
      visibilityTimeoutMs: options?.visibilityTimeoutMs,
    });
  }
}

/** Default queue used when none is specified. */
export const DefaultQueue = Queue.create("default", {
  description: "Default background job queue",
  defaultMaxAttempts: 3,
  visibilityTimeoutMs: 30_000,
});
