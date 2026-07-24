export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

/** Shared assertion helpers for end-to-end scenarios. */
export class AssertionLibrary {
  assertSuccess(condition: unknown, message = "Expected successful result"): asserts condition {
    if (!condition) {
      throw new AssertionError(message);
    }
  }

  assertFailure(condition: unknown, message = "Expected failure"): void {
    if (condition) {
      throw new AssertionError(message);
    }
  }

  assertEquals<T>(actual: T, expected: T, message?: string): void {
    const serializedActual = JSON.stringify(actual);
    const serializedExpected = JSON.stringify(expected);
    if (serializedActual !== serializedExpected) {
      throw new AssertionError(
        message ?? `Expected ${serializedExpected}, received ${serializedActual}`,
      );
    }
  }

  assertStatus(actual: string, expected: string, message?: string): void {
    if (actual.trim().toLowerCase() !== expected.trim().toLowerCase()) {
      throw new AssertionError(message ?? `Expected status "${expected}", received "${actual}"`);
    }
  }

  assertEvent(
    events: readonly { readonly name: string }[],
    eventName: string,
    message?: string,
  ): void {
    const found = events.some((event) => event.name === eventName);
    if (!found) {
      throw new AssertionError(message ?? `Expected event "${eventName}" was not emitted`);
    }
  }
}
