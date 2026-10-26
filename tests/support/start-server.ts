// Serves the built site (dist/) with the Pages Functions on a throwaway local D1 database,
// the way Cloudflare Pages runs it. Used by Playwright's webServer; run `pnpm build` first.
// Alerts go to a local receiver that tests/integration starts; no real email or push is sent.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { DB_NAME, PERSIST_DIR, wrangler } from "./wrangler.ts";

if (!existsSync("dist/index.html")) {
  console.error(
    "dist/ is missing. Run `pnpm build` before the integration and E2E tests.",
  );
  process.exit(1);
}

rmSync(PERSIST_DIR, { recursive: true, force: true });
execFileSync(
  wrangler,
  ["d1", ...localD1Args(), "--file", "migrations/0001_intake.sql"],
  {
    stdio: "inherit",
  },
);

const server = spawn(
  wrangler,
  [
    "pages",
    "dev",
    "dist",
    "--d1",
    `DB=${DB_NAME}`,
    "--persist-to",
    PERSIST_DIR,
    "--binding",
    "NTFY_TOPIC_URL=http://127.0.0.1:8799/topic",
    "--ip",
    "127.0.0.1",
    "--port",
    "8788",
    "--show-interactive-dev-session=false",
  ],
  { stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code ?? 0));

function localD1Args() {
  return [
    "execute",
    DB_NAME,
    "--local",
    "--config",
    "tests/wrangler.jsonc",
    "--persist-to",
    PERSIST_DIR,
  ];
}
