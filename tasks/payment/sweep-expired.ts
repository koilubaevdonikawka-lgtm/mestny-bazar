import { defineTask } from "nitro/task";

/**
 * Thin Nitro Task adapter — invoked by the Cloudflare Cron Trigger Nitro
 * generates from `scheduledTasks` in vite.config.ts (cloudflare_module preset
 * has native Cron Trigger integration, no manual wrangler.toml needed). All
 * real logic lives in server/functions/payment-sweep.executor.ts, matching
 * how every other route/wire-level file in this project stays thin and
 * delegates to server/**.
 */
export default defineTask({
  meta: {
    name: "payment:sweep-expired",
    description:
      "Expire pending/awaiting payments past their expiresAt and free their stock reservation",
  },
  async run() {
    // Relative import, not the @server/* alias — this file lives outside
    // src/** and server/** in Nitro's own tasks/ scan directory, processed
    // by Nitro's task bundler rather than Vite's normal module graph, so a
    // tsconfig path alias isn't guaranteed to resolve the same way here.
    const { executeSweepExpiredPayments } =
      await import("../../server/functions/payment-sweep.executor");
    const result = await executeSweepExpiredPayments();
    return { result };
  },
});
