// Cloudflare Pages Function: stores contact form submissions in D1.
// Needs a D1 binding named DB (Pages project > Settings > Bindings) with migrations/0001_intake.sql applied.
import { parseIntake } from "../../src/lib/intake";

type D1Database = {
  prepare(query: string): { bind(...values: unknown[]): { run(): Promise<unknown> } };
};

type Context = { request: Request; env: { DB?: D1Database } };

const redirect = (request: Request, path: string) => Response.redirect(new URL(path, request.url).toString(), 303);

export async function onRequestPost({ request, env }: Context) {
  const result = parseIntake(await request.formData());

  // Pretend spam succeeded so bots don't retry.
  if (!result.ok) return redirect(request, result.error === "spam" ? "/thanks" : "/contact-error");

  if (!env.DB) {
    console.error("intake: no D1 binding named DB");
    return redirect(request, "/contact-error");
  }

  const { name, email, business, message } = result.data;
  try {
    await env.DB.prepare("INSERT INTO intake (name, email, business, message) VALUES (?, ?, ?, ?)")
      .bind(name, email, business, message)
      .run();
  } catch (error) {
    console.error("intake: insert failed", error);
    return redirect(request, "/contact-error");
  }
  return redirect(request, "/thanks");
}
