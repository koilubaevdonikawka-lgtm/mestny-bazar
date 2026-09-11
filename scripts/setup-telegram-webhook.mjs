// Задача №264 — one-off Telegram Bot API setWebhook call. Run manually,
// exactly once (re-run only if the URL or secret ever changes):
//
//   TELEGRAM_WEBHOOK_SECRET=<the value saved in Cloudflare> node --env-file=.env scripts/setup-telegram-webhook.mjs
//
// (--env-file=.env picks up TELEGRAM_BOT_TOKEN from the local .env; the
// secret is passed inline rather than added to .env, since it only needs to
// exist here for this one call and shouldn't linger in a file on disk.)
//
// Deliberately NOT wired into any request-handling code path or CI step —
// setWebhook is a one-time Telegram-side registration, not something that
// should run automatically on every deploy.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
// Must match TELEGRAM_WEBHOOK_PATH in shared/contracts/telegram-bot.ts —
// plain string literal here since this script runs standalone via `node`,
// outside the app's own TS/Vite module graph.
const WEBHOOK_URL = "https://mesnyibazar.com/api/telegram-webhook";

if (!BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is not set (expected via --env-file=.env).");
  process.exit(1);
}
if (!WEBHOOK_SECRET) {
  console.error(
    "TELEGRAM_WEBHOOK_SECRET is not set — pass it inline, see this file's header comment.",
  );
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    url: WEBHOOK_URL,
    secret_token: WEBHOOK_SECRET,
    // Only the update types this bot actually handles.
    allowed_updates: ["message"],
  }),
});

const result = await response.json();
console.log(JSON.stringify(result, null, 2));

if (!response.ok || !result.ok) {
  console.error("setWebhook failed.");
  process.exit(1);
}
console.log(`\nWebhook registered: ${WEBHOOK_URL}`);
