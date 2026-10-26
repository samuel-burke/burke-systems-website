// Shared settings for the local, test-only D1 database. Everything here is --local.
import { execFileSync } from "node:child_process";

export const DB_NAME = "intake-test";
export const PERSIST_DIR = ".wrangler/test-state";
export const wrangler = "node_modules/.bin/wrangler";

/** Runs SQL against the local test database and returns the rows. */
export function query<Row = Record<string, unknown>>(sql: string): Row[] {
  const out = execFileSync(
    wrangler,
    [
      "d1",
      "execute",
      DB_NAME,
      "--local",
      "--config",
      "tests/wrangler.jsonc",
      "--persist-to",
      PERSIST_DIR,
      "--json",
      "--command",
      sql,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );
  return JSON.parse(out)[0].results;
}
