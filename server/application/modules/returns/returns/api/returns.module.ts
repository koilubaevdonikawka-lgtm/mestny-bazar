import type { StartReturnDto } from "@server/application/modules/returns/returns/dto";
import type { ReturnResult } from "@server/application/modules/returns/returns/models";
import type { ReturnsService } from "@server/application/modules/returns/returns/services";

/** Public entry point for the Returns business process module. */
export class ReturnsModule {
  constructor(private readonly service: ReturnsService) {}

  processReturn(input: StartReturnDto): Promise<ReturnResult> {
    return this.service.processReturn(input);
  }
}
