import { defineTask } from "nitro/task";

/**
 * Thin Nitro Task adapter — invoked by the Cloudflare Cron Trigger Nitro
 * generates from `scheduledTasks` in vite.config.ts. All real logic lives in
 * server/functions/order-cascade-sweep.executor.ts (same pattern as
 * tasks/courier/sweep-unassigned.ts).
 */
export default defineTask({
  meta: {
    name: "order:sweep-cascade",
    description:
      "Fire the operational cascade (staff notifications) for recent orders whose 2-minute buffer has elapsed",
  },
  async run() {
    // Relative import, not the @server/* alias — see tasks/courier/sweep-unassigned.ts.
    const { executeSweepOrderCascade } =
      await import("../../server/functions/order-cascade-sweep.executor");
    const result = await executeSweepOrderCascade();
    return { result };
  },
});
