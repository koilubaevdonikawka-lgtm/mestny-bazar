import { defineTask } from "nitro/task";

/**
 * Thin Nitro Task adapter — invoked by the Cloudflare Cron Trigger Nitro
 * generates from `scheduledTasks` in vite.config.ts (cloudflare_module preset
 * has native Cron Trigger integration, no manual wrangler.toml needed). All
 * real logic lives in server/functions/courier-assignment-sweep.executor.ts,
 * matching how every other route/wire-level file in this project stays thin
 * and delegates to server/** (same pattern as tasks/payment/sweep-expired.ts).
 */
export default defineTask({
  meta: {
    name: "courier:sweep-unassigned",
    description:
      "Retry courier auto-assignment for READY_FOR_DELIVERY orders that still have no assigned courier",
  },
  async run() {
    // Relative import, not the @server/* alias — this file lives outside
    // src/** and server/** in Nitro's own tasks/ scan directory, processed
    // by Nitro's task bundler rather than Vite's normal module graph, so a
    // tsconfig path alias isn't guaranteed to resolve the same way here.
    const { executeSweepUnassignedReadyOrders } =
      await import("../../server/functions/courier-assignment-sweep.executor");
    const result = await executeSweepUnassignedReadyOrders();
    return { result };
  },
});
