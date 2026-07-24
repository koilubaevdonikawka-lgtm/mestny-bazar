import type { StartReturnDto } from "@server/application/modules/returns/returns/dto";
import type { ReturnResult } from "@server/application/modules/returns/returns/models";
import type { ReturnsProcess } from "@server/application/modules/returns/returns/processes";

/** Returns process service — delegates orchestration to ReturnsProcess. */
export class ReturnsService {
  constructor(private readonly process: ReturnsProcess) {}

  processReturn(input: StartReturnDto): Promise<ReturnResult> {
    return this.process.execute(input);
  }
}
