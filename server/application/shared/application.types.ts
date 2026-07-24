/** Marker for command objects entering use cases. */
export interface ApplicationCommand {
  readonly commandName: string;
}

/** Marker for query objects entering use cases. */
export interface ApplicationQuery {
  readonly queryName: string;
}

export interface UseCaseResult<T> {
  readonly value: T;
}

export function useCaseResult<T>(value: T): UseCaseResult<T> {
  return Object.freeze({ value });
}
