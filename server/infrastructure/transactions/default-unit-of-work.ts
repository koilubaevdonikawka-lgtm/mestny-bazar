import type { IUnitOfWork } from "@server/application/ports";

/** In-memory unit of work with nested transaction depth tracking. */
export class DefaultUnitOfWork implements IUnitOfWork {
  private depth = 0;
  private rollbackHandlers: Array<() => void | Promise<void>> = [];

  async begin(): Promise<void> {
    this.depth += 1;
  }

  async commit(): Promise<void> {
    if (this.depth === 0) {
      return;
    }

    this.depth -= 1;
    if (this.depth === 0) {
      this.rollbackHandlers = [];
    }
  }

  async rollback(): Promise<void> {
    if (this.depth === 0) {
      return;
    }

    const handlers = [...this.rollbackHandlers].reverse();
    this.rollbackHandlers = [];
    this.depth = 0;

    for (const handler of handlers) {
      await handler();
    }
  }

  registerRollback(handler: () => void | Promise<void>): void {
    if (this.depth > 0) {
      this.rollbackHandlers.push(handler);
    }
  }

  getDepth(): number {
    return this.depth;
  }
}
