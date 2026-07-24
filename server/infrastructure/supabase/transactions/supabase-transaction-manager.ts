import type { ITransactionManager, IUnitOfWork } from "@server/application/ports";

/**
 * Supabase transaction manager.
 *
 * LIMITATIONS:
 * Supabase PostgREST does not expose multi-statement SQL transactions over HTTP.
 * This manager coordinates logical units of work via {@link IUnitOfWork} only.
 * Database-level atomicity is not guaranteed — use compensating rollback handlers
 * registered on the unit of work for cross-aggregate consistency.
 */
export class SupabaseTransactionManager implements ITransactionManager {
  constructor(private readonly unitOfWork: IUnitOfWork) {
    Object.freeze(this);
  }

  async execute<T>(work: () => Promise<T>): Promise<T> {
    await this.unitOfWork.begin();

    try {
      const result = await work();
      await this.unitOfWork.commit();
      return result;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
