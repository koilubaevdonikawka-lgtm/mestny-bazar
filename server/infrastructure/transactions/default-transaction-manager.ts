import type { ITransactionManager, IUnitOfWork } from "@server/application/ports";

/** Local transaction manager coordinating a single unit of work. */
export class DefaultTransactionManager implements ITransactionManager {
  constructor(private readonly unitOfWork: IUnitOfWork) {}

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
